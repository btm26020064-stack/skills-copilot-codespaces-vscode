import { NextResponse, type NextRequest } from 'next/server';
import { redirectUrl } from '@/lib/site-url';

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(redirectUrl(request, '/login'));

  response.cookies.set({
    name: 'session',
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0
  });

  return response;
}