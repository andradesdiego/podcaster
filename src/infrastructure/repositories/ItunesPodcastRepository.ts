import { PodcastRepository } from "../../application/ports/PodcastRepository";
import { Podcast } from "../../domain/entities/Podcast";
import { Episode } from "../../domain/entities/Episode";
import { PodcastId } from "../../domain/value-objects/PodcastId";
import { HttpClient } from "../http/HttpClient";
import {
  ItunesLookupResponse,
  ItunesMappers,
  ItunesTopPodcastsResponse,
} from "../mappers/ItunesMappers";
import { config } from "../../config/env";

export class ItunesPodcastRepository implements PodcastRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getTopPodcasts(): Promise<Podcast[]> {
    const response = await this.httpClient.get<ItunesTopPodcastsResponse>(
      config.topPodcastsUrl,
    );
    return ItunesMappers.mapTopPodcastsResponse(response);
  }

  async getPodcastById(id: PodcastId): Promise<Podcast | null> {
    const { podcast } = await this.fetchPodcastWithEpisodes(id);
    return podcast;
  }

  async getEpisodesByPodcastId(podcastId: PodcastId): Promise<Episode[]> {
    const { episodes } = await this.fetchPodcastWithEpisodes(podcastId);
    return episodes;
  }

  async getEpisodeById(
    episodeId: string,
    podcastId: PodcastId,
  ): Promise<Episode | null> {
    const episodes = await this.getEpisodesByPodcastId(podcastId);
    return episodes.find((episode) => episode.getId() === episodeId) || null;
  }

  private async fetchPodcastWithEpisodes(podcastId: PodcastId) {
    const url = `${config.lookupUrl}?id=${podcastId.getValue()}&media=podcast&entity=podcastEpisode&limit=20`;

    const response = await this.httpClient.get<ItunesLookupResponse>(url);

    return ItunesMappers.mapLookupResponse(response, podcastId.getValue());
  }
}
