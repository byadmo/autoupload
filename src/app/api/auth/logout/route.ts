import { NextResponse } from 'next/server';
import { clearInstagramTokens, clearTikTokTokens, clearYouTubeTokens } from '@/lib/auth-cookie';
import type { OAuthProvider } from '@/lib/auth-cookie';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  let provider: OAuthProvider | 'all' = 'all';

  try {
    const body = (await request.json()) as { provider?: OAuthProvider };
    provider = body.provider ?? 'all';
  } catch {
    provider = 'all';
  }

  if (provider === 'youtube') {
    await clearYouTubeTokens();
  } else if (provider === 'tiktok') {
    await clearTikTokTokens();
  } else if (provider === 'instagram') {
    await clearInstagramTokens();
  } else {
    await Promise.all([clearYouTubeTokens(), clearTikTokTokens(), clearInstagramTokens()]);
  }

  return NextResponse.json({ ok: true });
}
