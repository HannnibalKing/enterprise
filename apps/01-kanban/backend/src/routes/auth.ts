import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getUserByEmail, sanitizeUser } from '../store';
import { getJwtSecret } from '../auth';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' });
    return;
  }
  const user = getUserByEmail(email.toLowerCase().trim());
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    getJwtSecret(),
    { expiresIn: '24h' }
  );
  res.json({ token, user: sanitizeUser(user) });
});

// GET /api/auth/me
router.get('/me', (req: Request, res: Response) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) { res.status(401).json({ error: 'Unauthorized' }); return; }
  const secret = getJwtSecret();
  try {
    const payload = jwt.verify(header.slice(7), secret);
    if (typeof payload === 'string' || typeof payload.userId !== 'string') {
      res.status(401).json({ error: 'Invalid token' }); return;
    }
    const { users } = require('../store');
    const user = users.get(payload.userId);
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json(sanitizeUser(user));
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
