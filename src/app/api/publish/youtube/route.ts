import { NextRequest, NextResponse } from 'next/server';
import { getYouTubeTokens } from '@/lib/auth-cookie';
import { getPublisher } from '@/lib/publishers/registry';
import type { PublishVisibility } from '@/types/publishing';

import { getAppSession } from '@/lib/app-session';
export const runtime = 'nodejs';
export const maxDuration = 300;

const allowedVisibilities: PublishVisibility[] = ['private', 'unlisted', 'public'];

export async function POST(request: NextRequest) {
  const session = await getAppSession();
  if (!session) {
    return NextResponse.json({ error: 'Log in as admin before publishing.' }, { status: 401 });
  }

  const tokens = await getYouTubeTokens();
  if (!tokens) {
    return NextResponse.json({ error: 'Connect YouTube before publishing.' }, { status: 401 });
  }

  const formData = await request.formData();
  const video = formData.get('video');
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const visibilityValue = String(formData.get('visibility') ?? 'private') as PublishVisibility;
  const tags = String(formData.get('tags') ?? '')
    .split(',')
    .map((tag) => tag.trim().replace(/^#/, ''))
    .filter(Boolean);

  if (!(video instanceof File) || !video.type.startsWith('video/')) {
    return NextResponse.json({ error: 'Upload a valid video file.' }, { status: 400 });
  }

  if (!title) {
    return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
  }

  if (!allowedVisibilities.includes(visibilityValue)) {
    return NextResponse.json({ error: 'Invalid visibility value.' }, { status: 400 });
  }

  const publisher = getPublisher('youtube', tokens);
  const result = await publisher.publish(video, { title, description, visibility: visibilityValue, tags });

  return NextResponse.json(result);
}
