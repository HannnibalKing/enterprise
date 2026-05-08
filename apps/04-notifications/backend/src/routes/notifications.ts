import { Router } from 'express';
import { notifications } from '../store';
import { authMiddleware } from '../auth';
import { processEvent } from '../engine';

const router = Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
  let list = [...notifications.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const { channel, priority, unread } = req.query as Record<string, string>;
  if (channel) list = list.filter((n) => n.channel === channel);
  if (priority) list = list.filter((n) => n.priority === priority);
  if (unread === 'true') list = list.filter((n) => !n.readBy.includes(req.user!.userId));
  res.json(list);
});

router.get('/:id', (req, res) => {
  const n = notifications.get(req.params.id);
  if (!n) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(n);
});

router.post('/:id/read', (req, res) => {
  const n = notifications.get(req.params.id);
  if (!n) { res.status(404).json({ error: 'Not found' }); return; }
  const userId = req.user!.userId;
  if (!n.readBy.includes(userId)) {
    const updated = { ...n, readBy: [...n.readBy, userId], read: true };
    notifications.set(n.id, updated);
    res.json(updated);
  } else {
    res.json(n);
  }
});

router.post('/read-all', (req, res) => {
  const userId = req.user!.userId;
  let count = 0;
  for (const n of notifications.values()) {
    if (!n.readBy.includes(userId)) {
      notifications.set(n.id, { ...n, readBy: [...n.readBy, userId], read: true });
      count++;
    }
  }
  res.json({ marked: count });
});

router.delete('/:id', (req, res) => {
  if (!notifications.has(req.params.id)) { res.status(404).json({ error: 'Not found' }); return; }
  notifications.delete(req.params.id);
  res.status(204).send();
});

// Trigger endpoint: accept external events, run rule engine
router.post('/trigger', (req, res) => {
  const event = req.body as Record<string, unknown>;
  if (!event || typeof event !== 'object') { res.status(400).json({ error: 'Invalid event' }); return; }
  const created = processEvent(event);
  res.json({ triggered: created.length, notifications: created });
});

export default router;
