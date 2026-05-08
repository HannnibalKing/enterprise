import { Router } from 'express';
import { users } from '../store';
import { authMiddleware } from '../auth';

const router = Router();
router.use(authMiddleware);

router.get('/', (_req, res) => {
  const list = [...users.values()].map(({ passwordHash: _, ...safe }) => safe);
  res.json(list);
});

router.patch('/prefs', (req, res) => {
  const user = users.get(req.user!.userId);
  if (!user) { res.status(404).json({ error: 'Not found' }); return; }
  const prefs = req.body as typeof user.channelPrefs;
  const updated = { ...user, channelPrefs: { ...user.channelPrefs, ...prefs } };
  users.set(user.id, updated);
  const { passwordHash: _, ...safe } = updated;
  res.json(safe);
});

export default router;
