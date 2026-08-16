import { NextResponse } from 'next/server';
import { clearYouTubeTokens } from '@/lib/auth-cookie';

export async function POST() {
  await clearYouTubeTokens();
  return NextResponse.json({ ok: true });
}
