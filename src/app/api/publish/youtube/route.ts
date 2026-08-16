import { NextRequest, NextResponse } from 'next/server';
import { getYouTubeTokens } from '@/lib/auth-cookie';
import { getPublisher } from '@/lib/publishers/registry';
import type { PublishVisibility } from '@/types/publishing';

export const runtime = 'nodejs';
export const maxDuration = 300;

const allowedVisibilities: PublishVisibility[] = ['private', 'unlisted', 'public'];

export async function POST(request: NextRequest) {
  const tokens = await getYouTubeTokens();
  if (!tokens) {
    return NextResponse.json({ error: 'Connect YouTube before publishing.' }, { status: 401 });
  }

  const formData = await request.formData();
  const video = formData.get('video');
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const visibilityValue = String(formData.get('visibility') ?? 'private') as PublishVisibility;

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
  const result = await publisher.publish(video, { title, description, visibility: visibilityValue });

  return NextResponse.json(result);
}
