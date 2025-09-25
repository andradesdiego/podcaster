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

export interface ApiResponse {
  feed?: {
    entry?: PodcastEntry[];
  };
}
