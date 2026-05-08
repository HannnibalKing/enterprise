import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { SpaceUser } from './types';
import { store } from './store';
export const COOKIE_NAME = 'raptor_session';
const secret = new TextEncoder().encode('raptor-propulsion-lab-secret-2026');
export async function signToken(payload: Record<string, unknown>) {
  return new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('12h').sign(secret);
}
export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, secret); return payload;
}
export async function getSessionUser(): Promise<SpaceUser | null> {
  const cs = await cookies(); const token = cs.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try { const p = await verifyToken(token); return store.users.find(u => u.id === p.sub) ?? null; }
  catch { return null; }
}
