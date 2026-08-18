import type { Credentials } from 'google-auth-library';
import type { VideoPublisher } from '@/types/publishing';
import { YouTubeShortsPublisher } from '@/lib/publishers/youtube';

export type PublisherProvider = 'youtube';

export function getPublisher(provider: PublisherProvider, tokens: Credentials): VideoPublisher {
  switch (provider) {
    case 'youtube':
      return new YouTubeShortsPublisher(tokens);
  }
}
