import { google } from 'googleapis';
import { getEnv } from '@/lib/env';
import { getYouTubeRedirectUri } from '@/lib/app-url';
import type { NextRequest } from 'next/server';

export const YOUTUBE_UPLOAD_SCOPE = 'https://www.googleapis.com/auth/youtube.upload';

export function createOAuthClient(redirectUri?: string) {
  return new google.auth.OAuth2(
    getEnv('GOOGLE_CLIENT_ID'),
    getEnv('GOOGLE_CLIENT_SECRET'),
    redirectUri ?? getYouTubeRedirectUri(),
  );
}

export function createYouTubeAuthUrl(state: string, request?: NextRequest) {
  const redirectUri = getYouTubeRedirectUri(request);

  return createOAuthClient(redirectUri).generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [YOUTUBE_UPLOAD_SCOPE],
    state,
  });
}
