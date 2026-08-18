import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'crypto';
import type { Credentials } from 'google-auth-library';
import { getCookieSecret } from '@/lib/env';

export type OAuthProvider = 'youtube' | 'tiktok' | 'instagram';

type SocialTokenPayload = {
  code: string;
  connectedAt: number;
};

const TOKEN_COOKIE: Record<OAuthProvider, string> = {
  youtube: 'youtube_tokens',
  tiktok: 'tiktok_tokens',
  instagram: 'instagram_tokens',
};

const STATE_COOKIE: Record<OAuthProvider, string> = {
  youtube: 'youtube_oauth_state',
  tiktok: 'tiktok_oauth_state',
  instagram: 'instagram_oauth_state',
};

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

export async function setOAuthState(provider: OAuthProvider, state: string) {
  (await cookies()).set(STATE_COOKIE[provider], pack({ state }), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 600 });
}

export async function consumeOAuthState(provider: OAuthProvider) {
  const store = await cookies();
  const cookieName = STATE_COOKIE[provider];
  const value = store.get(cookieName)?.value;
  store.delete(cookieName);
  return value ? unpack<{ state: string }>(value)?.state ?? null : null;
}

export async function setYouTubeTokens(tokens: Credentials) {
  (await cookies()).set(TOKEN_COOKIE.youtube, pack(tokens), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 30 });
}

export async function getYouTubeTokens() {
  const value = (await cookies()).get(TOKEN_COOKIE.youtube)?.value;
  return value ? unpack<Credentials>(value) : null;
}

export async function clearYouTubeTokens() {
  (await cookies()).delete(TOKEN_COOKIE.youtube);
}

async function setSocialTokens(provider: Exclude<OAuthProvider, 'youtube'>, tokens: SocialTokenPayload) {
  (await cookies()).set(TOKEN_COOKIE[provider], pack(tokens), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 30 });
}

async function getSocialTokens(provider: Exclude<OAuthProvider, 'youtube'>) {
  const value = (await cookies()).get(TOKEN_COOKIE[provider])?.value;
  return value ? unpack<SocialTokenPayload>(value) : null;
}

async function clearSocialTokens(provider: Exclude<OAuthProvider, 'youtube'>) {
  (await cookies()).delete(TOKEN_COOKIE[provider]);
}

export async function setTikTokTokens(code: string) {
  await setSocialTokens('tiktok', { code, connectedAt: Date.now() });
}

export async function getTikTokTokens() {
  return getSocialTokens('tiktok');
}

export async function clearTikTokTokens() {
  await clearSocialTokens('tiktok');
}

export async function setInstagramTokens(code: string) {
  await setSocialTokens('instagram', { code, connectedAt: Date.now() });
}

export async function getInstagramTokens() {
  return getSocialTokens('instagram');
}

export async function clearInstagramTokens() {
  await clearSocialTokens('instagram');
}
