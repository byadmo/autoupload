# AutoUpload Shorts

A Next.js + TypeScript V1 for publishing vertical videos to YouTube Shorts with the official YouTube Data API.

## Setup

1. Create a Google Cloud project, enable the YouTube Data API v3, and create OAuth 2.0 Web Application credentials.
2. Add `http://localhost:3000/api/auth/youtube/callback` as an authorized redirect URI for local development.
3. Copy `.env.example` to `.env.local` and fill in the Google credentials and a long `AUTH_COOKIE_SECRET`.
4. Install dependencies and run the app:

```bash
npm install
npm run dev
```

## Deployment

This is a full-stack Next.js app, so it must run on a platform that supports server-side API routes. GitHub Pages can host only static files and cannot run OAuth or publish endpoints directly.

1. Deploy the repository on your preferred Next.js-compatible host.
2. Set these environment variables:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `AUTH_COOKIE_SECRET`
   - Optional social OAuth authorize URLs: `TIKTOK_AUTH_URL`, `INSTAGRAM_AUTH_URL`
   - `NEXT_PUBLIC_APP_URL` set to your production deployment URL, for example `https://your-domain.com`
   - `GOOGLE_REDIRECT_URI` is optional; set it only if you want to override the callback URL shown on the deployed page.
3. In Google Cloud OAuth credentials, add your production callback URL as an authorized redirect URI:
   - `https://your-domain.com/api/auth/youtube/callback`

See `DEPLOYMENT.md` for GitHub Pages launcher setup and deployment details.

## Architecture

- `src/types/publishing.ts` defines the platform-neutral publisher contract.
- `src/lib/publishers/youtube.ts` implements the YouTube Shorts publisher.
- `src/lib/publishers/registry.ts` is the extension point for future Instagram and TikTok publishers.
- `src/lib/youtube/oauth.ts` contains YouTube OAuth helpers.
- `src/lib/app-url.ts` derives callback URLs for local development and deployed environments.
- `src/app/api/config/status/route.ts` lets the client detect whether OAuth environment variables are ready and show setup guidance instead of a broken connect link.

## App login

The dashboard supports OAuth account connection for YouTube, TikTok, and Instagram:

- YouTube uses Google OAuth and is required for publishing in this version.
- TikTok and Instagram connections are available from their provider cards.
- For TikTok/Instagram, configure each provider authorize URL so OAuth redirects back to this app:
  - `.../api/auth/tiktok/callback`
  - `.../api/auth/instagram/callback`

## YouTube Shorts notes

The app uses OAuth 2.0 with `https://www.googleapis.com/auth/youtube.upload`, uploads via `videos.insert`, adds `#Shorts` to the title when needed, and sets privacy from the UI.
