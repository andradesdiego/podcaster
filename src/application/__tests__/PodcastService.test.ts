import { describe, it, expect, beforeEach, vi } from "vitest";
import { PodcastService } from "../services/PodcastService";

const mockGetTopPodcasts = {
  execute: vi.fn(),
} as any;

const mockGetPodcastDetails = {
  execute: vi.fn(),
} as any;

const mockGetEpisodeDetails = {
  execute: vi.fn(),
} as any;

describe("PodcastService", () => {
  let service: PodcastService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new PodcastService(
      mockGetTopPodcasts,
      mockGetPodcastDetails,
      mockGetEpisodeDetails
    );
  });

  describe("getTopPodcasts", () => {
    it("delegates to GetTopPodcasts use case", async () => {
      const mockPodcasts = [
        {
          id: "1",
          title: "Test",
          author: "Author",
          image: "img",
          description: "desc",
        },
      ];
      mockGetTopPodcasts.execute.mockResolvedValue(mockPodcasts);

      const result = await service.getTopPodcasts();

      expect(mockGetTopPodcasts.execute).toHaveBeenCalled();
      expect(result).toEqual(mockPodcasts);
    });
  });

  describe("getPodcastDetails", () => {
    it("delegates to GetPodcastDetails use case", async () => {
      const mockDetail = {
        id: "1",
        title: "Test Podcast",
        author: "Author",
        image: "img",
        description: "desc",
        episodeCount: 5,
        episodes: [],
      };
      mockGetPodcastDetails.execute.mockResolvedValue(mockDetail);

      const result = await service.getPodcastDetails("1");

      expect(mockGetPodcastDetails.execute).toHaveBeenCalledWith("1");
      expect(result).toEqual(mockDetail);
    });
  });

  describe("getEpisodeDetails", () => {
    it("delegates to GetEpisodeDetails use case", async () => {
      const mockEpisode = {
        id: "ep1",
        title: "Test Episode",
        description: "desc",
        publishedAt: "15/01/2024",
        podcastId: "1",
      };
      mockGetEpisodeDetails.execute.mockResolvedValue(mockEpisode);

      const result = await service.getEpisodeDetails("ep1", "1");

      expect(mockGetEpisodeDetails.execute).toHaveBeenCalledWith("ep1", "1");
      expect(result).toEqual(mockEpisode);
    });
  });

  describe("filterPodcasts", () => {
    const mockPodcasts = [
      {
        id: "1",
        title: "JavaScript Podcast",
        author: "John Doe",
        image: "img1",
        description: "desc1",
      },
      {
        id: "2",
        title: "React Show",
        author: "Jane Smith",
        image: "img2",
        description: "desc2",
      },
      {
        id: "3",
        title: "Python Talk",
        author: "Bob Johnson",
        image: "img3",
        description: "desc3",
      },
    ];

    it("returns all podcasts if search term is empty", () => {
      expect(service.filterPodcasts(mockPodcasts, "")).toEqual(mockPodcasts);
      expect(service.filterPodcasts(mockPodcasts, "   ")).toEqual(mockPodcasts);
    });

    it("filters by title (case insensitive)", () => {
      const result = service.filterPodcasts(mockPodcasts, "javascript");
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("JavaScript Podcast");
    });

    it("filters by author (case insensitive)", () => {
      const result = service.filterPodcasts(mockPodcasts, "jane");
      expect(result).toHaveLength(1);
      expect(result[0].author).toBe("Jane Smith");
    });

    it("returns empty array if no matches found", () => {
      const result = service.filterPodcasts(mockPodcasts, "golang");
      expect(result).toHaveLength(0);
    });
  });
});
