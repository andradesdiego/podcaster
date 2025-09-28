export interface PodcastListDTO {
  id: string;
  title: string;
  author: string;
  image: string;
  description: string;
}

export interface PodcastDetailDTO extends PodcastListDTO {
  episodeCount: number;
  episodes: EpisodeDTO[];
}

export interface EpisodeDTO {
  id: string;
  title: string;
  description: string;
  audioUrl?: string;
  duration?: string;
  publishedAt: string;
  podcastId: string;
}
