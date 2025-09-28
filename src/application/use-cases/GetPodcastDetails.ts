import { PodcastId } from '../../domain/value-objects/PodcastId';
import { PodcastRepository } from '../ports/PodcastRepository';
import { CacheRepository } from '../ports/CacheRepository';
import { PodcastDetailDTO, EpisodeDTO } from '../dto/PodcastDTO';
import { PodcastNotFoundError } from '../../domain/errors/DomainError';
import { Podcast } from '../../domain/entities/Podcast';
import { Episode } from '../../domain/entities/Episode';
import { config } from '../../config/env';

export class GetPodcastDetails {
  private static readonly CACHE_TTL_HOURS = config.cacheTTLHours;

  constructor(
    private readonly podcastRepository: PodcastRepository,
    private readonly cacheRepository: CacheRepository
  ) {}

  async execute(podcastId: string): Promise<PodcastDetailDTO> {
    const id = PodcastId.create(podcastId);
    const cacheKey = `podcast_detail_${id.getValue()}`;

    const cachedDetail = this.getCachedDetail(cacheKey);
    if (cachedDetail) {
      return cachedDetail;
    }

    const podcast = await this.podcastRepository.getPodcastById(id);
    if (!podcast) {
      throw new PodcastNotFoundError(id.getValue());
    }

    const episodes = await this.podcastRepository.getEpisodesByPodcastId(id);
    const podcastDetail = this.mapToDetailDTO(podcast, episodes);

    this.cacheRepository.set(
      cacheKey,
      podcastDetail,
      GetPodcastDetails.CACHE_TTL_HOURS
    );

    return podcastDetail;
  }

  private getCachedDetail(cacheKey: string): PodcastDetailDTO | null {
    if (this.cacheRepository.isExpired(cacheKey)) {
      this.cacheRepository.clear(cacheKey);
      return null;
    }

    return this.cacheRepository.get<PodcastDetailDTO>(cacheKey);
  }

  private mapToDetailDTO(
    podcast: Podcast,
    episodes: Episode[]
  ): PodcastDetailDTO {
    return {
      id: podcast.getId().getValue(),
      title: podcast.getTitle(),
      author: podcast.getAuthor(),
      image: podcast.getBestImageUrl(),
      description: podcast.getDescription(),
      episodeCount: episodes.length,
      episodes: this.mapEpisodesToDTO(episodes),
    };
  }

  private mapEpisodesToDTO(episodes: Episode[]): EpisodeDTO[] {
    return episodes.map((episode) => ({
      id: episode.getId(),
      title: episode.getTitle(),
      description: episode.getDescription(),
      audioUrl: episode.getAudioUrl() || undefined,
      duration: episode.getMinutesForTable() || undefined,
      publishedAt: episode.getFormattedDate(),
      podcastId: episode.getPodcastId().getValue(),
    }));
  }
}
