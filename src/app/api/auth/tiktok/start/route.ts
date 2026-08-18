import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  if (!process.env.TIKTOK_AUTH_URL) {
    return NextResponse.redirect(new URL('/?auth=tiktok-coming-soon', request.url));
  }

  return NextResponse.redirect(process.env.TIKTOK_AUTH_URL);
}
