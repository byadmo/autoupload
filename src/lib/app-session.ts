import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'crypto';
import { getCookieSecret } from '@/lib/env';

const SESSION_COOKIE = 'autoupload_session';
const adminUsername = 'admin';
const adminPassword = 'admin';

type SessionPayload = {
  username: string;
  issuedAt: number;
};

function sign(value: string) {
  return createHmac('sha256', getCookieSecret()).update(value).digest('base64url');
}

function pack(value: SessionPayload) {
  const payload = Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function unpack(value: string): SessionPayload | null {
  const [payload, signature] = value.split('.');
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== actualBuffer.length || !timingSafeEqual(expectedBuffer, actualBuffer)) {
    return null;
  }

  return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as SessionPayload;
}

export function isAdminCredentials(username: string, password: string) {
  return username === adminUsername && password === adminPassword;
}

export async function setAppSession(username: string) {
  (await cookies()).set(SESSION_COOKIE, pack({ username, issuedAt: Date.now() }), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getAppSession() {
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!value) return null;

  const session = unpack(value);
  return session?.username === adminUsername ? session : null;
}

export async function clearAppSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function requireAppSession() {
  const session = await getAppSession();
  if (!session) {
    throw new Error('Authentication required.');
  }
  return session;
}
