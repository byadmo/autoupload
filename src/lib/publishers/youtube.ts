import { Readable } from 'stream';
import { google } from 'googleapis';
import type { Credentials } from 'google-auth-library';
import type { PublishMetadata, PublishResult, VideoPublisher } from '@/types/publishing';
import { createOAuthClient } from '@/lib/youtube/oauth';

export class YouTubeShortsPublisher implements VideoPublisher {
  readonly provider = 'youtube';

  constructor(private readonly tokens: Credentials) {}

  async publish(video: File, metadata: PublishMetadata): Promise<PublishResult> {
    const auth = createOAuthClient();
    auth.setCredentials(this.tokens);

    const youtube = google.youtube({ version: 'v3', auth });
    const normalizedTitle = metadata.title.includes('#Shorts') ? metadata.title : `${metadata.title} #Shorts`;
    const buffer = Buffer.from(await video.arrayBuffer());

    const response = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title: normalizedTitle,
          description: metadata.description,
          tags: Array.from(new Set([...(metadata.tags ?? []), 'Shorts'])),
          categoryId: '22',
        },
        status: {
          privacyStatus: metadata.visibility,
          selfDeclaredMadeForKids: false,
        },
      },
      media: {
        mimeType: video.type || 'video/mp4',
        body: Readable.from(buffer),
      },
    });

    const videoId = response.data.id;
    if (!videoId) {
      throw new Error('YouTube upload completed without returning a video ID.');
    }

    return {
      provider: this.provider,
      videoId,
      url: `https://youtube.com/shorts/${videoId}`,
    };
  }
}
