import { NextRequest, NextResponse } from 'next/server';
import { getYouTubeRedirectUri } from '@/lib/app-url';

export async function GET(request: NextRequest) {
  const hasGoogleClientId = Boolean(process.env.GOOGLE_CLIENT_ID);
  const hasGoogleClientSecret = Boolean(process.env.GOOGLE_CLIENT_SECRET);
  const hasCookieSecret = Boolean(process.env.AUTH_COOKIE_SECRET);

  return NextResponse.json({
    authenticated: true,
    youtubeReady: hasGoogleClientId && hasGoogleClientSecret && hasCookieSecret,
    hasGoogleClientId,
    hasGoogleClientSecret,
    hasCookieSecret,
    callbackUrl: getYouTubeRedirectUri(request),
    providers: {
      youtube: hasGoogleClientId && hasGoogleClientSecret && hasCookieSecret ? 'ready' : 'needs_env',
      tiktok: process.env.TIKTOK_AUTH_URL ? 'ready' : 'needs_env',
      instagram: process.env.INSTAGRAM_AUTH_URL ? 'ready' : 'needs_env',
    },
  });
}
