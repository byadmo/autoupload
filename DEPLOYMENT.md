# Deployment

The production app must run on Vercel because YouTube OAuth and video upload publishing require server-side API routes. GitHub Pages can only host static files, so this repo includes a static GitHub Pages launcher that redirects users to the Vercel deployment.

## Vercel deployment

1. Create a Vercel project for this repository.
2. Add these Vercel environment variables:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `AUTH_COOKIE_SECRET`
   - `NEXT_PUBLIC_APP_URL` with the production Vercel URL, for example `https://your-project.vercel.app`
3. Add the app callback URL in Google Cloud OAuth credentials:
   - `https://your-project.vercel.app/api/auth/youtube/callback`
4. Optional GitHub Actions deployment: add repository secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID`, then run the **Deploy to Vercel** workflow. If these secrets are missing, the workflow exits successfully with a clear skip message instead of failing on Vercel CLI authentication.

## GitHub Pages launcher

1. In GitHub repository settings, enable Pages from GitHub Actions.
2. Add repository variable `VERCEL_APP_URL` with the production Vercel URL.
3. Run the **Deploy GitHub Pages launcher** workflow.
4. Visitors to GitHub Pages will see a static launcher and be redirected to the Vercel app, where OAuth and publishing work.

GitHub Pages cannot directly run `/api/auth/*` or `/api/publish/*`; using it as a launcher keeps the page accessible while preserving the working full-stack Vercel app.
