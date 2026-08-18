import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { setOAuthState } from '@/lib/auth-cookie';

export async function GET(request: NextRequest) {
  if (!process.env.INSTAGRAM_AUTH_URL) {
    return NextResponse.redirect(new URL('/?auth=instagram-missing-config', request.url));
  }

  const authUrl = new URL(process.env.INSTAGRAM_AUTH_URL);
  const state = randomBytes(32).toString('base64url');
  authUrl.searchParams.set('state', state);
  await setOAuthState('instagram', state);
  return NextResponse.redirect(authUrl);
}
