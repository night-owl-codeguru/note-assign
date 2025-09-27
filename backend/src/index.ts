import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import mongoose from 'mongoose';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { getCookie, setCookie } from 'hono/cookie';

import auth from './routes/auth.ts';
import notes from './routes/notes.ts';

const app = new Hono();

app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', cors({
  origin: (origin) => {
    const allowed = process.env.CORS_ORIGIN || 'http://localhost:5173';
    return allowed;
  },
  credentials: true,
}));

app.get('/health', (c) => c.json({ ok: true }));

// Connect DB
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI in env');
}

mongoose.connect(MONGODB_URI || '').then(() => {
  console.log('MongoDB connected');
}).catch((e) => {
  console.error('MongoDB connection error', e);
});

app.route('/auth', auth);
app.route('/notes', notes);

const port = Number(process.env.PORT || 3000);
console.log(`API starting on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
