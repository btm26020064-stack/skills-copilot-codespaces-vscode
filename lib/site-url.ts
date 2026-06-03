import type { NextRequest } from 'next/server';

export function getBaseUrl(request: NextRequest) {
  return process.env.APP_URL || request.nextUrl.origin;
}

export function redirectUrl(request: NextRequest, path: string) {
  return new URL(path, getBaseUrl(request));
}