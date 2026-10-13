import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { store } from './store';
export const COOKIE_NAME = 'forgemax_session';
function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET must be configured');
  return new TextEncoder().encode(secret);
}
export async function signToken(payload: Record<string, unknown>) {
  return new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('12h').sign(getSecret());
}
export async function verifyToken(token: string, secret = getSecret()) {
  const { payload } = await jwtVerify(token, secret); return payload;
}
export async function getSessionUser() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const secret = getSecret();
  try { const p = await verifyToken(token, secret); return store.users.find(u => u.id === p.sub) ?? null; }
  catch { return null; }
}
