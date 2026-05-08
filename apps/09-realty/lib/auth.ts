import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { store } from './store';

export const COOKIE_NAME = 'nexus_realty_session';
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? 'nexus-realty-secret-2026');

export async function signToken(payload: Record<string, unknown>) {
  return new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('12h').sign(SECRET);
}
export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, SECRET);
  return payload;
}
export async function getSessionUser() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const p = await verifyToken(token);
    return store.users.find(u => u.id === p.sub) ?? null;
  } catch { return null; }
}
