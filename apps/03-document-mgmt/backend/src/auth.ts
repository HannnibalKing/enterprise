import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthPayload } from './types';

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET must be configured');
  return secret;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request { user?: AuthPayload; }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) { res.status(401).json({ error: 'Missing token' }); return; }
  const secret = getJwtSecret();
  try {
    const payload = jwt.verify(header.slice(7), secret);
    if (typeof payload === 'string' || typeof payload.userId !== 'string') {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
    req.user = { userId: payload.userId };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
