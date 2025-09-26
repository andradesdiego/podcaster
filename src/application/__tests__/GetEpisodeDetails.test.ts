import { describe, it, expect, beforeEach, vi } from "vitest";
import { GetEpisodeDetails } from "../use-cases/GetEpisodeDetails";
import { PodcastRepository } from "../ports/PodcastRepository";
import { Podcast } from "../../domain/entities/Podcast";
import { Episode } from "../../domain/entities/Episode";
import {
  PodcastNotFoundError,
  EpisodeNotFoundError,
} from "../../domain/errors/DomainError";

const mockPodcastRepository: PodcastRepository = {
  getTopPodcasts: vi.fn(),
  getPodcastById: vi.fn(),
  getEpisodesByPodcastId: vi.fn(),
  getEpisodeById: vi.fn(),
};

describe("GetEpisodeDetails", () => {
  let useCase: GetEpisodeDetails;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new GetEpisodeDetails(mockPodcastRepository);
  });

  const createMockPodcast = () =>
    Podcast.create({
      id: "123",
      title: "Test Podcast",
      author: "Test Author",
      description: "Test Description",
      image: "https://example.com/image55x55bb.jpg",
    });

  const createMockEpisode = () =>
    Episode.create({
      id: "ep1",
      title: "Test Episode",
      description: "Episode Description",
      audioUrl: "https://example.com/audio.mp3",
      duration: 3600,
      publishedAt: "2024-01-15T10:00:00Z",
      podcastId: "123",
    });

  describe("execute", () => {
    it("throws error if podcast does not exist", async () => {
      vi.mocked(mockPodcastRepository.getPodcastById).mockResolvedValue(null);

      await expect(useCase.execute("ep1", "123")).rejects.toThrow(
        PodcastNotFoundError
      );
    });

    it("throws error if episode does not exist", async () => {
      const mockPodcast = createMockPodcast();
      vi.mocked(mockPodcastRepository.getPodcastById).mockResolvedValue(
        mockPodcast
      );
      vi.mocked(mockPodcastRepository.getEpisodeById).mockResolvedValue(null);

      await expect(useCase.execute("ep1", "123")).rejects.toThrow(
        EpisodeNotFoundError
      );
    });

    it("returns episode details successfully", async () => {
      const mockPodcast = createMockPodcast();
      const mockEpisode = createMockEpisode();

      vi.mocked(mockPodcastRepository.getPodcastById).mockResolvedValue(
        mockPodcast
      );
      vi.mocked(mockPodcastRepository.getEpisodeById).mockResolvedValue(
        mockEpisode
      );

      const result = await useCase.execute("ep1", "123");

      expect(result.id).toBe("ep1");
      expect(result.title).toBe("Test Episode");
      expect(result.publishedAt).toBe("15/01/2024");
      expect(result.podcastId).toBe("123");
    });
  });
});
