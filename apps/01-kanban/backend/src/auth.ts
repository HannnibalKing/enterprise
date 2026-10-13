import { Request, Response, NextFunction } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { AuthPayload } from './types';

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET must be configured');
  return secret;
}

function isAuthPayload(payload: string | JwtPayload): payload is JwtPayload & AuthPayload {
  return typeof payload !== 'string'
    && typeof payload.userId === 'string'
    && typeof payload.email === 'string'
    && typeof payload.role === 'string';
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }
  const secret = getJwtSecret();
  try {
    const payload = jwt.verify(header.slice(7), secret);
    if (!isAuthPayload(payload)) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
    (req as Request & { user: AuthPayload }).user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as Request & { user?: AuthPayload }).user;
    if (!user || !roles.includes(user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}
