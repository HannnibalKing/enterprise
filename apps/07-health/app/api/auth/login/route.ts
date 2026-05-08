import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { store } from '@/lib/store';
import { signToken, COOKIE_NAME } from '@/lib/auth';
export async function POST(req: NextRequest) {
  let body: {email?:unknown;password?:unknown};
  try { body=await req.json(); } catch { return NextResponse.json({error:'Invalid body'},{status:400}); }
  const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';
  const password=typeof body.password==='string'?body.password:'';
  if(!email||!password) return NextResponse.json({error:'Required fields missing'},{status:400});
  const user=[...store.users.values()].find(u=>u.email.toLowerCase()===email);
  if(!user||!bcrypt.compareSync(password,user.passwordHash)) return NextResponse.json({error:'Invalid credentials'},{status:401});
  const token=await signToken({userId:user.id});
  const res=NextResponse.json({user:{id:user.id,name:user.name,role:user.role}});
  res.cookies.set(COOKIE_NAME,token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:43200});
  return res;
}
