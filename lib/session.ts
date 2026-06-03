import { cookies } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose';

export type SessionRole = 'ADMIN' | 'CLIENT';

export type SessionPayload = {
  sub: string;
  name: string;
  email: string;
  role: SessionRole;
};

const secretKey = () => new TextEncoder().encode(process.env.JWT_SECRET || 'development-secret');

export async function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey());
}

export async function verifySession(token: string) {
  const { payload } = await jwtVerify(token, secretKey());
  return payload as unknown as SessionPayload;
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (!token) {
    return null;
  }

  try {
    return await verifySession(token);
  } catch {
    return null;
  }
}