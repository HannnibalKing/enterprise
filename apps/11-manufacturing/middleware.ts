import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET must be configured');
  return new TextEncoder().encode(secret);
}
const COOKIE = 'forgemax_session';
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === '/login' || pathname.startsWith('/api/auth/')) return NextResponse.next();
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return NextResponse.redirect(new URL('/login', req.url));
  const secret = getSecret();
  try { await jwtVerify(token, secret); return NextResponse.next(); }
  catch { const r = NextResponse.redirect(new URL('/login', req.url)); r.cookies.delete(COOKIE); return r; }
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
