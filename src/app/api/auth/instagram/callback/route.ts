import { NextRequest, NextResponse } from 'next/server';
import { consumeOAuthState, setInstagramTokens } from '@/lib/auth-cookie';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const expectedState = await consumeOAuthState('instagram');

  if (!code || !state || state !== expectedState) {
    return NextResponse.redirect(new URL('/?auth=instagram-failed', request.url));
  }

  await setInstagramTokens(code);
  return NextResponse.redirect(new URL('/?auth=instagram-connected', request.url));
}
