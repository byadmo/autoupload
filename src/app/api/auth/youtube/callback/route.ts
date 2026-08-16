import { NextRequest, NextResponse } from 'next/server';
import { consumeOAuthState, setYouTubeTokens } from '@/lib/auth-cookie';
import { createOAuthClient } from '@/lib/youtube/oauth';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const expectedState = await consumeOAuthState();

  if (!code || !state || state !== expectedState) {
    return NextResponse.redirect(new URL('/?auth=failed', request.url));
  }

  const client = createOAuthClient();
  const { tokens } = await client.getToken(code);
  await setYouTubeTokens(tokens);

  return NextResponse.redirect(new URL('/?auth=connected', request.url));
}
