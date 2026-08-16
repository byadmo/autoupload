import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'crypto';
import type { Credentials } from 'google-auth-library';
import { getCookieSecret } from '@/lib/env';

const TOKEN_COOKIE = 'youtube_tokens';
const STATE_COOKIE = 'youtube_oauth_state';

function sign(value: string) {
  return createHmac('sha256', getCookieSecret()).update(value).digest('base64url');
}

function pack(value: unknown) {
  const payload = Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function unpack<T>(packed: string): T | null {
  const [payload, signature] = packed.split('.');
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
    return null;
  }

  return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as T;
}

export async function setOAuthState(state: string) {
  (await cookies()).set(STATE_COOKIE, pack({ state }), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 600 });
}

export async function consumeOAuthState() {
  const store = await cookies();
  const value = store.get(STATE_COOKIE)?.value;
  store.delete(STATE_COOKIE);
  return value ? unpack<{ state: string }>(value)?.state ?? null : null;
}

export async function setYouTubeTokens(tokens: Credentials) {
  (await cookies()).set(TOKEN_COOKIE, pack(tokens), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 30 });
}

export async function getYouTubeTokens() {
  const value = (await cookies()).get(TOKEN_COOKIE)?.value;
  return value ? unpack<Credentials>(value) : null;
}

export async function clearYouTubeTokens() {
  (await cookies()).delete(TOKEN_COOKIE);
}
