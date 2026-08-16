import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { setOAuthState } from '@/lib/auth-cookie';
import { createYouTubeAuthUrl } from '@/lib/youtube/oauth';

export async function GET() {
  const state = randomBytes(32).toString('base64url');
  await setOAuthState(state);
  return NextResponse.redirect(createYouTubeAuthUrl(state));
}
