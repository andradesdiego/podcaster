import { GetTopPodcasts } from "../use-cases/GetTopPodcasts";
import { GetPodcastDetails } from "../use-cases/GetPodcastDetails";
import { GetEpisodeDetails } from "../use-cases/GetEpisodeDetails";
import {
  PodcastListDTO,
  PodcastDetailDTO,
  EpisodeDTO,
} from "../dto/PodcastDTO";

export class PodcastService {
  constructor(
    private readonly getTopPodcastsUseCase: GetTopPodcasts,
    private readonly getPodcastDetailsUseCase: GetPodcastDetails,
    private readonly getEpisodeDetailsUseCase: GetEpisodeDetails
  ) {}

  async getTopPodcasts(): Promise<PodcastListDTO[]> {
    return this.getTopPodcastsUseCase.execute();
  }

  async getPodcastDetails(podcastId: string): Promise<PodcastDetailDTO> {
    return this.getPodcastDetailsUseCase.execute(podcastId);
  }

  async getEpisodeDetails(
    episodeId: string,
    podcastId: string
  ): Promise<EpisodeDTO> {
    return this.getEpisodeDetailsUseCase.execute(episodeId, podcastId);
  }
  filterPodcasts(
    podcasts: PodcastListDTO[],
    searchTerm: string
  ): PodcastListDTO[] {
    if (!searchTerm.trim()) return podcasts;

    const term = searchTerm.toLowerCase().trim();
    return podcasts.filter(
      (podcast) =>
        podcast.title.toLowerCase().includes(term) ||
        podcast.author.toLowerCase().includes(term)
    );
  }
}
