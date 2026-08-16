export type PublishVisibility = 'private' | 'unlisted' | 'public';

export type PublishMetadata = {
  title: string;
  description: string;
  visibility: PublishVisibility;
  tags?: string[];
};

export type PublishResult = {
  provider: string;
  videoId: string;
  url: string;
};

export interface VideoPublisher {
  readonly provider: string;
  publish(video: File, metadata: PublishMetadata): Promise<PublishResult>;
}
