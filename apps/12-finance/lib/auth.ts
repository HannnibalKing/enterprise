import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { FinUser } from './types';
import { store } from './store';

export const COOKIE_NAME = 'luminary_session';
const secret = new TextEncoder().encode('luminary-finance-secret-2026');

export async function signToken(payload: Record<string, unknown>) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('12h')
    .sign(secret);
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

export async function getSessionUser(): Promise<FinUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const payload = await verifyToken(token);
    return store.users.find(u => u.id === payload.sub) ?? null;
  } catch { return null; }
}
