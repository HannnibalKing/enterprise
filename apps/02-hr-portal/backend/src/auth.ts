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
    && typeof payload.employeeId === 'string'
    && (payload.role === 'hr_admin' || payload.role === 'manager' || payload.role === 'employee');
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing token' });
    return;
  }
  const secret = getJwtSecret();
  try {
    const payload = jwt.verify(header.slice(7), secret);
    if (!isAuthPayload(payload)) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireRole(...roles: AuthPayload['role'][]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    next();
  };
}
