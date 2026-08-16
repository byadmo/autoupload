import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { setOAuthState } from '@/lib/auth-cookie';
import { createYouTubeAuthUrl } from '@/lib/youtube/oauth';

export async function GET(request: NextRequest) {
  const state = randomBytes(32).toString('base64url');
  await setOAuthState(state);
  return NextResponse.redirect(createYouTubeAuthUrl(state, request));
}
