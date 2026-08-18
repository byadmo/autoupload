import { NextResponse } from 'next/server';
import { getYouTubeTokens } from '@/lib/auth-cookie';

export async function GET() {
  const tokens = await getYouTubeTokens();
  const isAuthenticated = Boolean(tokens?.access_token || tokens?.refresh_token);
  return NextResponse.json({ youtube: isAuthenticated, authenticated: isAuthenticated });
}
