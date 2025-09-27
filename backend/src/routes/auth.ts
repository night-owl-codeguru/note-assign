import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { getCookie, setCookie } from 'hono/cookie';
import { User } from '../models/User';
import { signJwt } from '../utils/jwt';
import { verifyJwt } from '../utils/jwt';
import { OAuth2Client } from 'google-auth-library';
import { Otp } from '../models/Otp';
import { OtpRequest } from '../models/OtpRequest';

const MAILERSEND_API_KEY = process.env.MAILERSEND_API_KEY || '';
const MAIL_FROM_EMAIL = process.env.MAIL_FROM_EMAIL || 'no-reply@example.com';
const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME || 'Note Assign';

// Rate limit configuration
const OTP_TTL_MINUTES = 5; // OTP validity duration
const RATE_LIMIT_PER_MIN = 3; // per email per 1 minute
const RATE_LIMIT_PER_HOUR = 10; // per email per hour
const RATE_LIMIT_PER_IP_MIN = 10; // per IP per 1 minute

const router = new Hono();

// Request OTP: email required; name/dob required only for new users (signup)
router.post('/request-otp', zValidator('json', z.object({
  email: z.string().email(),
  name: z.string().min(2).optional(),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/,{ message: 'DOB must be YYYY-MM-DD' }).optional(),
})), async (c) => {
  const { email, name, dob } = c.req.valid('json');
  const loweredEmail = email.toLowerCase();
  const existing = await User.findOne({ email: loweredEmail }).select('_id');

  // Rate limiting windows
  const now = new Date();
  const oneMinAgo = new Date(now.getTime() - 60 * 1000);
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || c.req.header('x-real-ip') || (c.req.header('cf-connecting-ip')) || '';

  const [minCount, hourCount, ipMinCount] = await Promise.all([
    OtpRequest.countDocuments({ email: loweredEmail, createdAt: { $gte: oneMinAgo } }),
    OtpRequest.countDocuments({ email: loweredEmail, createdAt: { $gte: oneHourAgo } }),
    ip ? OtpRequest.countDocuments({ ip, createdAt: { $gte: oneMinAgo } }) : Promise.resolve(0),
  ]);

  if (minCount >= RATE_LIMIT_PER_MIN) return c.json({ error: 'Too many requests, please wait a minute' }, 429);
  if (hourCount >= RATE_LIMIT_PER_HOUR) return c.json({ error: 'Too many requests this hour, try later' }, 429);
  if (ip && ipMinCount >= RATE_LIMIT_PER_IP_MIN) return c.json({ error: 'Too many requests from this IP, slow down' }, 429);
  if (!existing) {
    if (!name || !dob) {
      return c.json({ error: 'Name and date of birth are required for signup' }, 400);
    }
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
  // Upsert current OTP for the email (optional: you can replace existing)
  await Otp.deleteMany({ email: loweredEmail });
  await Otp.create({ email: loweredEmail, code, name: name || 'User', dob: dob || 'N/A', expiresAt });
  // Log request (two TTLs possible, but we store a single doc with short TTL per request)
  await OtpRequest.create({ email: loweredEmail, ip, expiresAt: new Date(Date.now() + 2 * 60 * 1000) });

  try {
    if (MAILERSEND_API_KEY) {
      await fetch('https://api.mailersend.com/v1/email', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MAILERSEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: { email: MAIL_FROM_EMAIL, name: MAIL_FROM_NAME },
          to: [{ email, name: name || 'User' }],
          subject: 'Your OTP for Note Assign',
          text: `Your OTP is: ${code} (valid 5 minutes)`,
          html: `<p>Your OTP is: <b>${code}</b></p><p>Valid for 5 minutes.</p>`,
        }),
      });
    } else {
      console.warn('MAILERSEND_API_KEY not set; skipping email, logging OTP:', code);
    }
    return c.json({ ok: true });
  } catch (e) {
    console.error('Failed to send OTP', e);
    return c.json({ error: 'Failed to send OTP' }, 500);
  }
});

router.post('/verify-otp', zValidator('json', z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  keepSignedIn: z.boolean().optional(),
})), async (c) => {
  const { email, otp, keepSignedIn } = c.req.valid('json');
  const loweredEmail = email.toLowerCase();
  const rec = await Otp.findOne({ email: loweredEmail });
  if (!rec) return c.json({ error: 'OTP not requested' }, 400);
  if (rec.expiresAt.getTime() < Date.now()) return c.json({ error: 'OTP expired' }, 400);
  if (rec.code !== otp) return c.json({ error: 'Invalid OTP' }, 400);

  // Upsert user
  const name = rec.name || 'User';
  const dob = rec.dob || 'N/A';
  let user = await User.findOne({ email: loweredEmail });
  if (!user) {
    user = await User.create({ email: loweredEmail, name, dob });
  }

  await Otp.deleteMany({ email: loweredEmail });

  const token = await signJwt({ sub: String(user._id) }, keepSignedIn ? '30d' : '7d');
  const cookieDomain = process.env.COOKIE_DOMAIN || 'localhost';
  setCookie(c, 'token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    domain: cookieDomain,
    path: '/',
    maxAge: keepSignedIn ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7,
  });
  return c.json({ ok: true });
});

// Google sign-in: accept ID token from frontend and verify server-side
router.post('/google', zValidator('json', z.object({
  idToken: z.string().min(10),
  keepSignedIn: z.boolean().optional(),
})), async (c) => {
  try {
    const { idToken, keepSignedIn } = c.req.valid('json');
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) return c.json({ error: 'Server not configured for Google sign-in' }, 500);

    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({ idToken, audience: clientId });
    const payload = ticket.getPayload();
    if (!payload?.email) return c.json({ error: 'Google token invalid' }, 400);

    const email = payload.email.toLowerCase();
    const name = payload.name || email.split('@')[0];
    const googleId = payload.sub || '';

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email, name, dob: 'Google', googleId });
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    const token = await signJwt({ sub: String(user._id) }, keepSignedIn ? '30d' : '7d');
    const cookieDomain = process.env.COOKIE_DOMAIN || 'localhost';
    setCookie(c, 'token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      domain: cookieDomain,
      path: '/',
      maxAge: keepSignedIn ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7,
    });

    return c.json({ ok: true });
  } catch (e) {
    console.error('Google auth failed', e);
    return c.json({ error: 'Google authentication failed' }, 400);
  }
});

router.get('/me', async (c) => {
  const token = getCookie(c, 'token') || (await c.req.header('authorization'))?.replace('Bearer ', '');
  if (!token) return c.json({ error: 'Unauthorized' }, 401);
  const payload = await verifyJwt<{ sub: string }>(token);
  if (!payload?.sub) return c.json({ error: 'Unauthorized' }, 401);
  const user = await User.findById(payload.sub).select('name email');
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  return c.json({ user: { name: user.name, email: user.email } });
});

export default router;
