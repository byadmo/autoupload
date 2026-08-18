import { NextRequest, NextResponse } from 'next/server';
import { consumeOAuthState, setTikTokTokens } from '@/lib/auth-cookie';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const expectedState = await consumeOAuthState('tiktok');

  if (!code || !state || state !== expectedState) {
    return NextResponse.redirect(new URL('/?auth=tiktok-failed', request.url));
  }

  await setTikTokTokens(code);
  return NextResponse.redirect(new URL('/?auth=tiktok-connected', request.url));
}
