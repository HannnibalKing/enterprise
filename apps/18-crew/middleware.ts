import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { COOKIE_NAME, verifyToken } from '@/lib/auth';
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/api/auth') || pathname === '/login') return NextResponse.next();
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.redirect(new URL('/login', req.url));
  try { await verifyToken(token); return NextResponse.next(); }
  catch { return NextResponse.redirect(new URL('/login', req.url)); }
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
