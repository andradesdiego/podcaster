import { PodcastId } from "../../domain/value-objects/PodcastId";
import { PodcastRepository } from "../ports/PodcastRepository";
import {
  EpisodeNotFoundError,
  PodcastNotFoundError,
} from "../../domain/errors/DomainError";
import { EpisodeDTO } from "../dto/PodcastDTO";

export class GetEpisodeDetails {
  constructor(private readonly podcastRepository: PodcastRepository) {}

  async execute(episodeId: string, podcastId: string): Promise<EpisodeDTO> {
    const id = PodcastId.create(podcastId);

    const podcast = await this.podcastRepository.getPodcastById(id);
    if (!podcast) {
      throw new PodcastNotFoundError(id.getValue());
    }

    const episode = await this.podcastRepository.getEpisodeById(episodeId, id);
    if (!episode) {
      throw new EpisodeNotFoundError(episodeId, id.getValue());
    }

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
