import { NextRequest, NextResponse } from 'next/server';
import { isAdminCredentials, setAppSession } from '@/lib/app-session';

export async function POST(request: NextRequest) {
  const { username, password } = (await request.json()) as { username?: string; password?: string };

  if (!isAdminCredentials(username ?? '', password ?? '')) {
    return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
  }

  await setAppSession('admin');
  return NextResponse.json({ authenticated: true, username: 'admin' });
}
