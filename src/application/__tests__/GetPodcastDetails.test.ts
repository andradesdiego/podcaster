import { describe, it, expect, beforeEach, vi } from "vitest";
import { GetPodcastDetails } from "../use-cases/GetPodcastDetails";
import { PodcastRepository } from "../ports/PodcastRepository";
import { CacheRepository } from "../ports/CacheRepository";
import { Podcast } from "../../domain/entities/Podcast";
import { Episode } from "../../domain/entities/Episode";
import { PodcastNotFoundError } from "../../domain/errors/DomainError";

const mockPodcastRepository: PodcastRepository = {
  getTopPodcasts: vi.fn(),
  getPodcastById: vi.fn(),
  getEpisodesByPodcastId: vi.fn(),
  getEpisodeById: vi.fn(),
};

const mockCacheRepository: CacheRepository = {
  get: vi.fn(),
  set: vi.fn(),
  isExpired: vi.fn(),
  clear: vi.fn(),
};

describe("GetPodcastDetails", () => {
  let useCase: GetPodcastDetails;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new GetPodcastDetails(mockPodcastRepository, mockCacheRepository);
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
      vi.mocked(mockCacheRepository.isExpired).mockReturnValue(false);
      vi.mocked(mockCacheRepository.get).mockReturnValue(null);
      vi.mocked(mockPodcastRepository.getPodcastById).mockResolvedValue(null);

      await expect(useCase.execute("123")).rejects.toThrow(
        PodcastNotFoundError
      );
    });

    it("returns details from cache if available", async () => {
      const cachedDetail = {
        id: "123",
        title: "Cached Podcast",
        author: "Cached Author",
        image: "image.jpg",
        description: "desc",
        episodeCount: 1,
        episodes: [],
      };

      vi.mocked(mockCacheRepository.isExpired).mockReturnValue(false);
      vi.mocked(mockCacheRepository.get).mockReturnValue(cachedDetail);

      const result = await useCase.execute("123");

      expect(result).toEqual(cachedDetail);
      expect(mockPodcastRepository.getPodcastById).not.toHaveBeenCalled();
    });

    it("fetches from repository and saves to cache", async () => {
      const mockPodcast = createMockPodcast();
      const mockEpisodes = [createMockEpisode()];

      vi.mocked(mockCacheRepository.isExpired).mockReturnValue(false);
      vi.mocked(mockCacheRepository.get).mockReturnValue(null);
      vi.mocked(mockPodcastRepository.getPodcastById).mockResolvedValue(
        mockPodcast
      );
      vi.mocked(mockPodcastRepository.getEpisodesByPodcastId).mockResolvedValue(
        mockEpisodes
      );

      const result = await useCase.execute("123");

      expect(result.title).toBe("Test Podcast");
      expect(result.episodeCount).toBe(1);
      expect(result.episodes).toHaveLength(1);
      expect(result.episodes[0].publishedAt).toBe("15/01/2024");
      expect(mockCacheRepository.set).toHaveBeenCalledWith(
        "podcast_detail_123",
        expect.any(Object),
        24
      );
    });
  });
});
