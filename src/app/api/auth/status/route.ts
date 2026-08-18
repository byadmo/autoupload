import { NextResponse } from 'next/server';
import { getInstagramTokens, getTikTokTokens, getYouTubeTokens } from '@/lib/auth-cookie';

export async function GET() {
  const [youtubeTokens, tiktokTokens, instagramTokens] = await Promise.all([getYouTubeTokens(), getTikTokTokens(), getInstagramTokens()]);
  const youtube = Boolean(youtubeTokens?.access_token || youtubeTokens?.refresh_token);
  const tiktok = Boolean(tiktokTokens?.code);
  const instagram = Boolean(instagramTokens?.code);

  return NextResponse.json({ youtube, tiktok, instagram, authenticated: youtube || tiktok || instagram });
}
