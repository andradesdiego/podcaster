import { PodcastId } from "../../domain/value-objects/PodcastId";
import { PodcastRepository } from "../ports/PodcastRepository";
import { CacheRepository } from "../ports/CacheRepository";
import { EpisodeDTO } from "../dto/PodcastDTO";
import { Episode } from "../../domain/entities/Episode";
import { config } from "../../config/env";

export class GetEpisodeDetails {
  private static readonly CACHE_TTL_HOURS = config.cacheTTLHours;

  constructor(
    private readonly podcastRepository: PodcastRepository,
    private readonly cacheRepository: CacheRepository,
  ) {}

  async execute(
    podcastId: string,
    episodeId: string,
  ): Promise<EpisodeDTO | null> {
    const id = PodcastId.create(podcastId);
    const cacheKey = `episode_${podcastId}_${episodeId}`;

    const cachedEpisode = this.getCachedEpisode(cacheKey);
    if (cachedEpisode) {
      return cachedEpisode;
    }

    const episodes = await this.podcastRepository.getEpisodesByPodcastId(id);
    const episode = episodes.find((ep) => ep.getId() === episodeId);

    if (!episode) {
      return null;
    }

    const episodeDTO = this.mapEpisodeToDTO(episode);

    this.cacheRepository.set(
      cacheKey,
      episodeDTO,
      GetEpisodeDetails.CACHE_TTL_HOURS,
    );

    return episodeDTO;
  }

  private getCachedEpisode(cacheKey: string): EpisodeDTO | null {
    if (this.cacheRepository.isExpired(cacheKey)) {
      this.cacheRepository.clear(cacheKey);
      return null;
    }

    return this.cacheRepository.get<EpisodeDTO>(cacheKey);
  }

  private mapEpisodeToDTO(episode: Episode): EpisodeDTO {
    return {
      id: episode.getId(),
      title: episode.getTitle(),
      description: episode.getDescription(),
      audioUrl: episode.getAudioUrl() || undefined,
      duration: episode.getDuration() || undefined,
      publishedAt: episode.getFormattedDate(),
      podcastId: episode.getPodcastId().getValue(),
    };
  }
}
