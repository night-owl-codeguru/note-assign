import { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';
import { verifyJwt } from '../utils/jwt';

export const authMiddleware = async (c: Context, next: Next) => {
  const token = getCookie(c, 'token') || (await c.req.header('authorization'))?.replace('Bearer ', '');
  if (!token) return c.json({ error: 'Unauthorized' }, 401);
  const payload = await verifyJwt<{ sub: string }>(token);
  if (!payload?.sub) return c.json({ error: 'Unauthorized' }, 401);
  // @ts-ignore augment context
  c.set('userId', payload.sub);
  await next();
};
