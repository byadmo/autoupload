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

## One-click deployment paths

- Use Vercel for the real app because OAuth and YouTube upload routes need server-side execution.
- Use the included GitHub Pages workflow as a static launcher that redirects visitors to the Vercel app. See `DEPLOYMENT.md` for the exact secrets, variables, and workflow steps.

## Deploying on Vercel

This is a full-stack Next.js app, so deploy it to Vercel rather than GitHub Pages. GitHub Pages can host static files, but this app needs serverless API routes for OAuth and YouTube publishing. The home page loads even before OAuth variables are configured and shows the exact callback URL to paste into Google Cloud.

1. Import the repository into Vercel as a Next.js project.
2. Open the deployed page once; it will show the callback URL derived from that Vercel deployment. Add these environment variables in Vercel Project Settings → Environment Variables:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `AUTH_COOKIE_SECRET`
   - `NEXT_PUBLIC_APP_URL` set to your production deployment, for example `https://your-project.vercel.app`
   - `GOOGLE_REDIRECT_URI` is optional; set it only if you want to override the callback URL shown on the deployed page.
3. In Google Cloud OAuth credentials, add your production callback URL as an authorized redirect URI:
   - `https://your-project.vercel.app/api/auth/youtube/callback`
4. Deploy. The included `vercel.json` pins the project to the Next.js framework and gives the YouTube publish route a longer function timeout. The app uses pinned Next.js/React versions in `package.json` so Vercel builds are reproducible instead of floating on `latest`.

### Vercel upload limit note

The app can be viewed and the OAuth flow can run on Vercel, but Vercel Serverless Functions have a small request payload limit. Real Shorts video files are often larger than that limit, so production-grade large video uploads should be moved to direct-to-cloud storage or a dedicated upload worker in the next iteration. The current V1 keeps the code modular so that upload storage can be added without changing the publisher interface.

## Architecture

- `src/types/publishing.ts` defines the platform-neutral publisher contract.
- `src/lib/publishers/youtube.ts` implements the YouTube Shorts publisher.
- `src/lib/publishers/registry.ts` is the extension point for future Instagram and TikTok publishers.
- `src/lib/youtube/oauth.ts` contains YouTube OAuth helpers.
- `src/lib/app-url.ts` derives callback URLs for local development and Vercel deployments.
- `src/app/api/config/status/route.ts` lets the client detect whether Vercel OAuth environment variables are ready and show setup guidance instead of a broken connect link.

## YouTube Shorts notes

The app uses OAuth 2.0 with `https://www.googleapis.com/auth/youtube.upload`, uploads via `videos.insert`, adds `#Shorts` to the title when needed, and sets privacy from the UI.
