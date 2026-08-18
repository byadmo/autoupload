import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { setOAuthState } from '@/lib/auth-cookie';
import { createYouTubeAuthUrl } from '@/lib/youtube/oauth';

export async function GET(request: NextRequest) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.redirect(new URL('/?auth=missing-config', request.url));
  }

  const state = randomBytes(32).toString('base64url');
  await setOAuthState('youtube', state);
  return NextResponse.redirect(createYouTubeAuthUrl(state, request));
}
