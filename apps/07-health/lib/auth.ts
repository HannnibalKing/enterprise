import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
export const COOKIE_NAME = 'meridian_session';
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? 'meridian-health-secret-2026');
export async function signToken(payload: { userId: string }) {
  return new SignJWT(payload).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('12h').sign(SECRET);
}
export async function verifyToken(token: string) {
  try { const { payload } = await jwtVerify(token, SECRET); return payload as { userId: string }; } catch { return null; }
}
export async function getSessionUser() {
  const jar = await cookies(); const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null; return verifyToken(token);
}
