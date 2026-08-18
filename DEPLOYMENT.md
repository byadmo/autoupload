# Deployment

This app requires a server runtime for YouTube OAuth and publishing routes. You can deploy it to any platform that supports Next.js server routes (self-hosted Node, cloud VM, container platform, etc.).

## App deployment

1. Deploy this repository as a Next.js app on your chosen host.
2. Add these environment variables on that host:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `AUTH_COOKIE_SECRET`
   - Optional provider authorize URLs: `TIKTOK_AUTH_URL`, `INSTAGRAM_AUTH_URL`
   - `NEXT_PUBLIC_APP_URL` with your production app URL, for example `https://your-domain.com`
3. Add the app callback URL in Google Cloud OAuth credentials:
   - `https://your-domain.com/api/auth/youtube/callback`
4. If you enable TikTok and Instagram login, configure each provider authorize URL to redirect back to:
   - `https://your-domain.com/api/auth/tiktok/callback`
   - `https://your-domain.com/api/auth/instagram/callback`

## GitHub Pages upload entry page

1. In GitHub repository settings, enable Pages from GitHub Actions.
2. Add repository variable `APP_URL` with your production app URL.
3. Run the **Deploy GitHub Pages launcher** workflow.
4. Visitors to GitHub Pages will see a static upload-style page and continue into your app for OAuth and publishing.

GitHub Pages cannot directly run `/api/auth/*` or `/api/publish/*`; using it as an upload entry page keeps the page accessible while preserving a working full-stack deployment.
