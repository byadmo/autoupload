import type { NextRequest } from 'next/server';

const localBaseUrl = 'http://localhost:3000';

function normalizeBaseUrl(url: string) {
  const withProtocol = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
  return withProtocol.replace(/\/$/, '');
}

export function getAppBaseUrl(request?: NextRequest) {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_URL);
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return normalizeBaseUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  }

  if (process.env.VERCEL_URL) {
    return normalizeBaseUrl(process.env.VERCEL_URL);
  }

  if (request) {
    return request.nextUrl.origin;
  }

  return localBaseUrl;
}

export function getYouTubeRedirectUri(request?: NextRequest) {
  return process.env.GOOGLE_REDIRECT_URI ?? `${getAppBaseUrl(request)}/api/auth/youtube/callback`;
}
