import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signToken, COOKIE_NAME } from '@/lib/auth';
import { store } from '@/lib/store';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  const user = store.users.find(u => u.name.toLowerCase().startsWith(username.toLowerCase()));
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  const token = await signToken({ sub: user.id, role: user.role });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 12, sameSite: 'lax' });
  return res;
}
