import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { setOAuthState } from '@/lib/auth-cookie';
import { createYouTubeAuthUrl } from '@/lib/youtube/oauth';

import { getAppSession } from '@/lib/app-session';
export async function GET(request: NextRequest) {
  const session = await getAppSession();
  if (!session) {
    return NextResponse.redirect(new URL('/?login=required', request.url));
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.redirect(new URL('/?auth=missing-config', request.url));
  }

  const state = randomBytes(32).toString('base64url');
  await setOAuthState(state);
  return NextResponse.redirect(createYouTubeAuthUrl(state, request));
}
