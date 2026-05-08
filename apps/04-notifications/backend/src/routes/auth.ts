import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getUserByEmail, users } from '../store';
import { authMiddleware, JWT_SECRET } from '../auth';

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) { res.status(400).json({ error: 'email and password required' }); return; }
  const user = getUserByEmail(email.toLowerCase());
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ error: 'Invalid credentials' }); return;
  }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
  const { passwordHash: _, ...safe } = user;
  res.json({ token, user: safe });
});

router.get('/me', authMiddleware, (req, res) => {
  const user = users.get(req.user!.userId);
  if (!user) { res.status(404).json({ error: 'Not found' }); return; }
  const { passwordHash: _, ...safe } = user;
  res.json(safe);
});

export default router;
