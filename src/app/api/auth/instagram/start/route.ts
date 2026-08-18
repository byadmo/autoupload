import { NextRequest, NextResponse } from 'next/server';
import { getAppSession } from '@/lib/app-session';

export async function GET(request: NextRequest) {
  const session = await getAppSession();
  if (!session) {
    return NextResponse.redirect(new URL('/?login=required', request.url));
  }

  if (!process.env.INSTAGRAM_AUTH_URL) {
    return NextResponse.redirect(new URL('/?auth=instagram-coming-soon', request.url));
  }

  return NextResponse.redirect(process.env.INSTAGRAM_AUTH_URL);
}
