import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getUserByEmail, employees } from '../store';
import { authMiddleware, JWT_SECRET } from '../auth';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) { res.status(400).json({ error: 'email and password required' }); return; }

  const user = getUserByEmail(email.toLowerCase());
  if (!user) { res.status(401).json({ error: 'Invalid credentials' }); return; }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) { res.status(401).json({ error: 'Invalid credentials' }); return; }

  const token = jwt.sign(
    { userId: user.id, employeeId: user.employeeId, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  const emp = employees.get(user.employeeId);
  res.json({ token, employee: emp });
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  const emp = employees.get(req.user!.employeeId);
  if (!emp) { res.status(404).json({ error: 'Not found' }); return; }
  res.json({ ...req.user, employee: emp });
});

export default router;
