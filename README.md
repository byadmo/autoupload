# AutoUpload Shorts

A Next.js + TypeScript V1 for publishing vertical videos to YouTube Shorts with the official YouTube Data API.

## Setup

1. Create a Google Cloud project, enable the YouTube Data API v3, and create OAuth 2.0 Web Application credentials.
2. Add `http://localhost:3000/api/auth/youtube/callback` as an authorized redirect URI.
3. Copy `.env.example` to `.env.local` and fill in the Google credentials and a long `AUTH_COOKIE_SECRET`.
4. Install dependencies and run the app:

```bash
npm install
npm run dev
```

## Architecture

- `src/types/publishing.ts` defines the platform-neutral publisher contract.
- `src/lib/publishers/youtube.ts` implements the YouTube Shorts publisher.
- `src/lib/publishers/registry.ts` is the extension point for future Instagram and TikTok publishers.
- `src/lib/youtube/oauth.ts` contains YouTube OAuth helpers.

## YouTube Shorts notes

The app uses OAuth 2.0 with `https://www.googleapis.com/auth/youtube.upload`, uploads via `videos.insert`, adds `#Shorts` to the title when needed, and sets privacy from the UI.
