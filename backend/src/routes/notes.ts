import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { authMiddleware } from '../middlewares/auth';
import { Note } from '../models/Note';

const router = new Hono();

router.use('*', authMiddleware);

router.get('/', async (c) => {
  // @ts-ignore
  const userId = c.get('userId');
  const notes = await Note.find({ userId }).sort({ createdAt: -1 });
  return c.json({ notes });
});

router.post('/', zValidator('json', z.object({ content: z.string().min(1) })), async (c) => {
  // @ts-ignore
  const userId = c.get('userId');
  const { content } = c.req.valid('json');
  const note = await Note.create({ userId, content });
  return c.json({ note });
});

router.delete('/:id', async (c) => {
  // @ts-ignore
  const userId = c.get('userId');
  const id = c.req.param('id');
  const note = await Note.findOneAndDelete({ _id: id, userId });
  if (!note) return c.json({ error: 'Not found' }, 404);
  return c.json({ ok: true });
});

export default router;
