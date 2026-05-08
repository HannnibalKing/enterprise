import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? 'nexus-realty-secret-2026');
const COOKIE = 'nexus_realty_session';
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === '/login' || pathname.startsWith('/api/auth/')) return NextResponse.next();
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return NextResponse.redirect(new URL('/login', req.url));
  try { await jwtVerify(token, SECRET); return NextResponse.next(); }
  catch { const r = NextResponse.redirect(new URL('/login', req.url)); r.cookies.delete(COOKIE); return r; }
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
