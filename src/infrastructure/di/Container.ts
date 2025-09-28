import { GetTopPodcasts } from "../../application/use-cases/GetTopPodcasts";
import { GetPodcastDetails } from "../../application/use-cases/GetPodcastDetails";
import { GetEpisodeDetails } from "../../application/use-cases/GetEpisodeDetails";
import { PodcastService } from "../../application/services/PodcastService";
import { PodcastRepository } from "../../application/ports/PodcastRepository";
import { CacheRepository } from "../../application/ports/CacheRepository";
import { ItunesPodcastRepository } from "../repositories/ItunesPodcastRepository";
import { LocalStorageCacheRepository } from "../cache/LocalStorageCacheRepository";
import { FetchHttpClient } from "../http/HttpClient";

export class Container {
  private static instance: Container;
  private services: Map<string, unknown> = new Map();

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  private constructor() {
    this.registerServices();
  }

  private registerServices(): void {
    const httpClient = new FetchHttpClient();
    const podcastRepository: PodcastRepository = new ItunesPodcastRepository(
      httpClient
    );
    const cacheRepository: CacheRepository = new LocalStorageCacheRepository();

    const getTopPodcastsUseCase = new GetTopPodcasts(
      podcastRepository,
      cacheRepository
    );
    const getPodcastDetailsUseCase = new GetPodcastDetails(
      podcastRepository,
      cacheRepository
    );
    const getEpisodeDetailsUseCase = new GetEpisodeDetails(podcastRepository);

    const podcastService = new PodcastService(
      getTopPodcastsUseCase,
      getPodcastDetailsUseCase,
      getEpisodeDetailsUseCase
    );

    this.services.set("HttpClient", httpClient);
    this.services.set("PodcastRepository", podcastRepository);
    this.services.set("CacheRepository", cacheRepository);
    this.services.set("GetTopPodcasts", getTopPodcastsUseCase);
    this.services.set("GetPodcastDetails", getPodcastDetailsUseCase);
    this.services.set("GetEpisodeDetails", getEpisodeDetailsUseCase);
    this.services.set("PodcastService", podcastService);
  }

  get<T>(serviceName: string): T {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }
    return service as T;
  }

  getPodcastService(): PodcastService {
    return this.get<PodcastService>("PodcastService");
  }
}
