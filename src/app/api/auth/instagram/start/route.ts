import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  if (!process.env.INSTAGRAM_AUTH_URL) {
    return NextResponse.redirect(new URL('/?auth=instagram-coming-soon', request.url));
  }

  return NextResponse.redirect(process.env.INSTAGRAM_AUTH_URL);
}
