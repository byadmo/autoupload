import { NextResponse } from 'next/server';
import { getAppSession } from '@/lib/app-session';

export async function GET() {
  const session = await getAppSession();
  return NextResponse.json({ authenticated: Boolean(session), username: session?.username ?? null });
}
