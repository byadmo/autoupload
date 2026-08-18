import { NextResponse } from 'next/server';
import { getYouTubeTokens } from '@/lib/auth-cookie';

import { getAppSession } from '@/lib/app-session';
export async function GET() {
  const session = await getAppSession();
  if (!session) {
    return NextResponse.json({ youtube: false, authenticated: false });
  }

  const tokens = await getYouTubeTokens();
  return NextResponse.json({ youtube: Boolean(tokens?.access_token || tokens?.refresh_token) });
}
