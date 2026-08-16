import { NextResponse } from 'next/server';
import { clearYouTubeTokens } from '@/lib/auth-cookie';

import { getAppSession } from '@/lib/app-session';
export async function POST() {
  const session = await getAppSession();
  if (!session) {
    return NextResponse.json({ ok: true });
  }

  await clearYouTubeTokens();
  return NextResponse.json({ ok: true });
}
