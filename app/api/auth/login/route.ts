import bcrypt from 'bcryptjs';
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signSession } from '@/lib/session';
import { redirectUrl } from '@/lib/site-url';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.redirect(redirectUrl(request, '/login?error=1'));
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    return NextResponse.redirect(redirectUrl(request, '/login?error=1'));
  }

  const token = await signSession({
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  });

  const response = NextResponse.redirect(redirectUrl(request, user.role === 'ADMIN' ? '/dashboard/admin' : '/dashboard'));

  response.cookies.set({
    name: 'session',
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  });

  return response;
}