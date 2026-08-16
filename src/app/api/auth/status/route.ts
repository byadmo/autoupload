import { NextResponse } from 'next/server';
import { getYouTubeTokens } from '@/lib/auth-cookie';

export async function GET() {
  const tokens = await getYouTubeTokens();
  return NextResponse.json({ youtube: Boolean(tokens?.access_token || tokens?.refresh_token) });
}
