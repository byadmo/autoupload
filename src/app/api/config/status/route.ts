import { NextRequest, NextResponse } from 'next/server';
import { getYouTubeRedirectUri } from '@/lib/app-url';

export async function GET(request: NextRequest) {
  const hasGoogleClientId = Boolean(process.env.GOOGLE_CLIENT_ID);
  const hasGoogleClientSecret = Boolean(process.env.GOOGLE_CLIENT_SECRET);
  const hasCookieSecret = Boolean(process.env.AUTH_COOKIE_SECRET);

  return NextResponse.json({
    youtubeReady: hasGoogleClientId && hasGoogleClientSecret && hasCookieSecret,
    hasGoogleClientId,
    hasGoogleClientSecret,
    hasCookieSecret,
    callbackUrl: getYouTubeRedirectUri(request),
    isVercel: Boolean(process.env.VERCEL || process.env.VERCEL_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL),
  });
}
