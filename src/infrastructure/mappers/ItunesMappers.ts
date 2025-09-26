import { Podcast, PodcastData } from "../../domain/entities/Podcast";
import { Episode, EpisodeData } from "../../domain/entities/Episode";

export interface ItunesTopPodcastsResponse {
  feed: {
    entry: ItunesTopPodcastEntry[];
  };
}

export interface ItunesTopPodcastEntry {
  id: { attributes: { "im:id": string } };
  "im:name": { label: string };
  "im:artist": { label: string };
  "im:image": Array<{ label: string }>;
  summary?: { label: string };
}

export interface ItunesLookupResponse {
  results: ItunesLookupResult[];
}

export interface ItunesLookupResult {
  collectionId?: number;
  collectionName?: string;
  artistName?: string;
  artworkUrl600?: string;
  collectionCensoredName?: string;
  trackId?: number;
  trackName?: string;
  description?: string;
  releaseDate?: string;
  trackTimeMillis?: number;
  episodeUrl?: string;
  kind?: string;
}

export class ItunesMappers {
  static mapTopPodcastsResponse(
    response: ItunesTopPodcastsResponse
  ): Podcast[] {
    return response.feed.entry.map((entry) => {
      const podcastData: PodcastData = {
        id: entry.id.attributes["im:id"],
        title: entry["im:name"].label,
        author: entry["im:artist"].label,
        description: entry.summary?.label || "",
        image: this.extractImageUrl(entry["im:image"]),
      };

      return Podcast.create(podcastData);
    });
  }

  static mapLookupResponse(
    response: ItunesLookupResponse,
    podcastId: string
  ): { podcast: Podcast | null; episodes: Episode[] } {
    if (!response.results || response.results.length === 0) {
      return { podcast: null, episodes: [] };
    }

    const podcastResult = response.results.find(
      (result) => result.kind === undefined || result.kind === "podcast"
    );
    const episodeResults = response.results.filter(
      (result) => result.kind === "podcast-episode"
    );

    let podcast: Podcast | null = null;
    if (podcastResult) {
      const podcastData: PodcastData = {
        id: podcastId,
        title:
          podcastResult.collectionName ||
          podcastResult.collectionCensoredName ||
          "",
        author: podcastResult.artistName || "",
        description: podcastResult.description || "",
        image: podcastResult.artworkUrl600 || "",
        episodeCount: episodeResults.length,
      };

      podcast = Podcast.create(podcastData);
    }

    const episodes = episodeResults.map((result) => {
      const episodeData: EpisodeData = {
        id: result.trackId?.toString() || "",
        title: result.trackName || "",
        description: result.description || "",
        audioUrl: result.episodeUrl,
        duration: result.trackTimeMillis
          ? Math.floor(result.trackTimeMillis / 1000)
          : undefined,
        publishedAt: result.releaseDate || new Date().toISOString(),
        podcastId,
      };

      return Episode.create(episodeData);
    });

    return { podcast, episodes };
  }

  private static extractImageUrl(images: Array<{ label: string }>): string {
    return images.length > 0 ? images[images.length - 1].label : "";
  }
}
