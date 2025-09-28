import { Podcast } from "../../domain/entities/Podcast";
import { PodcastRepository } from "../ports/PodcastRepository";
import { CacheRepository } from "../ports/CacheRepository";
import { PodcastListDTO } from "../dto/PodcastDTO";
import { config } from "../../config/env";

export class GetTopPodcasts {
  private static readonly CACHE_KEY = "top_podcasts";
  private static readonly CACHE_TTL_HOURS = config.cacheTTLHours;

  constructor(
    private readonly podcastRepository: PodcastRepository,
    private readonly cacheRepository: CacheRepository
  ) {}

  async execute(): Promise<PodcastListDTO[]> {
    const cachedPodcasts = this.getCachedPodcasts();
    if (cachedPodcasts) {
      return cachedPodcasts;
    }

    const podcasts = await this.podcastRepository.getTopPodcasts();
    const podcastDTOs = this.mapToDTO(podcasts);

    this.cacheRepository.set(
      GetTopPodcasts.CACHE_KEY,
      podcastDTOs,
      GetTopPodcasts.CACHE_TTL_HOURS
    );

    return podcastDTOs;
  }

  private getCachedPodcasts(): PodcastListDTO[] | null {
    if (this.cacheRepository.isExpired(GetTopPodcasts.CACHE_KEY)) {
      this.cacheRepository.clear(GetTopPodcasts.CACHE_KEY);
      return null;
    }

    return this.cacheRepository.get<PodcastListDTO[]>(GetTopPodcasts.CACHE_KEY);
  }

  private mapToDTO(podcasts: Podcast[]): PodcastListDTO[] {
    return podcasts.map((podcast) => ({
      id: podcast.getId().getValue(),
      title: podcast.getTitle(),
      author: podcast.getAuthor(),
      image: podcast.getBestImageUrl(),
      description: podcast.getDescription(),
    }));
  }
}
