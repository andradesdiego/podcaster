export interface PodcastImage {
  label: string;
  attributes: {
    height: string;
  };
}

export interface PodcastEntry {
  id: {
    attributes: {
      "im:id": string;
    };
  };
  "im:name": {
    label: string;
  };
  "im:artist": {
    label: string;
  };
  "im:image": PodcastImage[];
}

export interface PodcastFeed {
  feed: {
    entry: PodcastEntry[];
  };
}

export interface ApiResponse {
  feed?: {
    entry?: PodcastEntry[];
  };
}

export interface Episode {
  trackId: number;
  trackName: string;
  description?: string;
  releaseDate: string;
  trackTimeMillis?: number;
  episodeUrl?: string;
  artworkUrl160?: string;
}

export interface PodcastDetail {
  collectionId: number;
  collectionName: string;
  artistName: string;
  artworkUrl600?: string;
  description?: string;
  feedUrl?: string;
}

export interface PodcastLookupResponse {
  results: Array<PodcastDetail | Episode>;
}
