import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthPayload } from './types';

export const JWT_SECRET = process.env.JWT_SECRET || 'notifications-secret-change-in-prod';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request { user?: AuthPayload; }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) { res.status(401).json({ error: 'Missing token' }); return; }
  try { req.user = jwt.verify(h.slice(7), JWT_SECRET) as AuthPayload; next(); }
  catch { res.status(401).json({ error: 'Invalid token' }); }
}
