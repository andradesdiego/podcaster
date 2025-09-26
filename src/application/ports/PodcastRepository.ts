import { Podcast } from "../../domain/entities/Podcast";
import { Episode } from "../../domain/entities/Episode";
import { PodcastId } from "../../domain/value-objects/PodcastId";

export interface PodcastRepository {
  getTopPodcasts(): Promise<Podcast[]>;
  getPodcastById(id: PodcastId): Promise<Podcast | null>;
  getEpisodesByPodcastId(podcastId: PodcastId): Promise<Episode[]>;
  getEpisodeById(
    episodeId: string,
    podcastId: PodcastId
  ): Promise<Episode | null>;
}
