import { NextRequest, NextResponse } from 'next/server';
import { consumeOAuthState, setYouTubeTokens } from '@/lib/auth-cookie';
import { createOAuthClient } from '@/lib/youtube/oauth';
import { getYouTubeRedirectUri } from '@/lib/app-url';

import { getAppSession } from '@/lib/app-session';
export async function GET(request: NextRequest) {
  const session = await getAppSession();
  if (!session) {
    return NextResponse.redirect(new URL('/?login=required', request.url));
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.redirect(new URL('/?auth=missing-config', request.url));
  }

  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const expectedState = await consumeOAuthState();

  if (!code || !state || state !== expectedState) {
    return NextResponse.redirect(new URL('/?auth=failed', request.url));
  }

  const client = createOAuthClient(getYouTubeRedirectUri(request));
  const { tokens } = await client.getToken(code);
  await setYouTubeTokens(tokens);

  return NextResponse.redirect(new URL('/?auth=connected', request.url));
}
