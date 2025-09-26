import { describe, it, expect, beforeEach, vi } from "vitest";
import { GetTopPodcasts } from "../use-cases/GetTopPodcasts";
import { PodcastRepository } from "../ports/PodcastRepository";
import { CacheRepository } from "../ports/CacheRepository";
import { Podcast } from "../../domain/entities/Podcast";

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

describe("GetTopPodcasts", () => {
  let useCase: GetTopPodcasts;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new GetTopPodcasts(mockPodcastRepository, mockCacheRepository);
  });

  const createMockPodcast = (id: string) =>
    Podcast.create({
      id,
      title: `Podcast ${id}`,
      author: `Author ${id}`,
      description: `Description ${id}`,
      image: `https://example.com/image${id}55x55bb.jpg`,
    });

  describe("execute", () => {
    it("returns podcasts from cache if available and not expired", async () => {
      const cachedPodcasts = [
        {
          id: "1",
          title: "Cached Podcast",
          author: "Cached Author",
          image: "image.jpg",
          description: "desc",
        },
      ];

      vi.mocked(mockCacheRepository.isExpired).mockReturnValue(false);
      vi.mocked(mockCacheRepository.get).mockReturnValue(cachedPodcasts);

      const result = await useCase.execute();

      expect(result).toEqual(cachedPodcasts);
      expect(mockCacheRepository.isExpired).toHaveBeenCalledWith(
        "top_podcasts"
      );
      expect(mockCacheRepository.get).toHaveBeenCalledWith("top_podcasts");
      expect(mockPodcastRepository.getTopPodcasts).not.toHaveBeenCalled();
    });

    it("clears cache and fetches from repository if cache is expired", async () => {
      const mockPodcasts = [createMockPodcast("1"), createMockPodcast("2")];

      vi.mocked(mockCacheRepository.isExpired).mockReturnValue(true);
      vi.mocked(mockPodcastRepository.getTopPodcasts).mockResolvedValue(
        mockPodcasts
      );

      const result = await useCase.execute();

      expect(mockCacheRepository.clear).toHaveBeenCalledWith("top_podcasts");
      expect(mockPodcastRepository.getTopPodcasts).toHaveBeenCalled();
      expect(mockCacheRepository.set).toHaveBeenCalledWith(
        "top_podcasts",
        expect.any(Array),
        24
      );
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe("Podcast 1");
    });

    it("fetches from repository if no cache available", async () => {
      const mockPodcasts = [createMockPodcast("1")];

      vi.mocked(mockCacheRepository.isExpired).mockReturnValue(false);
      vi.mocked(mockCacheRepository.get).mockReturnValue(null);
      vi.mocked(mockPodcastRepository.getTopPodcasts).mockResolvedValue(
        mockPodcasts
      );

      const result = await useCase.execute();

      expect(mockPodcastRepository.getTopPodcasts).toHaveBeenCalled();
      expect(mockCacheRepository.set).toHaveBeenCalled();
      expect(result[0].image).toBe("https://example.com/image1600x600bb.jpg");
    });
  });
});
