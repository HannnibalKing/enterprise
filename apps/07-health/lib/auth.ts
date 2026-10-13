import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
export const COOKIE_NAME = 'meridian_session';
function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET must be configured');
  return new TextEncoder().encode(secret);
}
export async function signToken(payload: { userId: string }) {
  return new SignJWT(payload).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('12h').sign(getSecret());
}
export async function verifyToken(token: string) {
  const secret = getSecret();
  try { const {payload}=await jwtVerify(token,secret); return payload as {userId:string}; } catch { return null; }
}
export async function getSessionUser() {
  const jar = await cookies(); const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null; return verifyToken(token);
}
