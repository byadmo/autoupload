import { google } from 'googleapis';
import { getEnv } from '@/lib/env';

export const YOUTUBE_UPLOAD_SCOPE = 'https://www.googleapis.com/auth/youtube.upload';

export function createOAuthClient() {
  return new google.auth.OAuth2(
    getEnv('GOOGLE_CLIENT_ID'),
    getEnv('GOOGLE_CLIENT_SECRET'),
    getEnv('GOOGLE_REDIRECT_URI'),
  );
}

export function createYouTubeAuthUrl(state: string) {
  return createOAuthClient().generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [YOUTUBE_UPLOAD_SCOPE],
    state,
  });
}
