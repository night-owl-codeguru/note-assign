import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { authMiddleware } from '../middlewares/auth';
import { Note } from '../models/Note';
import { User } from '../models/User';

const router = new Hono();

router.use('*', authMiddleware);

router.get('/', async (c) => {
  // @ts-ignore
  const userId = c.get('userId');
  const user = await User.findById(userId).select('verified');
  if (!user?.verified) return c.json({ error: 'Account not verified' }, 403);
  const notes = await Note.find({ userId }).sort({ createdAt: -1 });
  return c.json({ notes });
});

router.post('/', zValidator('json', z.object({ content: z.string().min(1) })), async (c) => {
  // @ts-ignore
  const userId = c.get('userId');
  const user = await User.findById(userId).select('verified');
  if (!user?.verified) return c.json({ error: 'Account not verified' }, 403);
  const { content } = c.req.valid('json');
  const note = await Note.create({ userId, content });
  return c.json({ note });
});

router.delete('/:id', async (c) => {
  // @ts-ignore
  const userId = c.get('userId');
  const user = await User.findById(userId).select('verified');
  if (!user?.verified) return c.json({ error: 'Account not verified' }, 403);
  const id = c.req.param('id');
  const note = await Note.findOneAndDelete({ _id: id, userId });
  if (!note) return c.json({ error: 'Not found' }, 404);
  return c.json({ ok: true });
});

export default router;
