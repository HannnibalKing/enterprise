import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export const COOKIE_NAME = 'nexus_session';
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? 'nexus-capital-secret-2026');

export async function signToken(payload: { userId: string }): Promise<string> {
  return new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('12h').sign(SECRET);
}

export async function verifyToken(token: string): Promise<{ userId: string } | null> {
  try { const { payload } = await jwtVerify(token, SECRET); return { userId: payload.userId as string }; }
  catch { return null; }
}

export async function getSessionUser(): Promise<{ userId: string } | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}
