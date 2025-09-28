import { describe, it, expect } from "vitest";
import { ItunesMappers } from "../mappers/ItunesMappers";

describe("ItunesMappers", () => {
  describe("mapTopPodcastsResponse", () => {
    it("maps iTunes top podcasts response to Podcast entities", () => {
      const mockResponse = {
        feed: {
          entry: [
            {
              id: { attributes: { "im:id": "123456" } },
              "im:name": { label: "Test Podcast" },
              "im:artist": { label: "Test Author" },
              "im:image": [
                { label: "https://example.com/small.jpg" },
                { label: "https://example.com/large.jpg" },
              ],
              summary: { label: "Test description" },
            },
          ],
        },
      };

      const result = ItunesMappers.mapTopPodcastsResponse(mockResponse);

      expect(result).toHaveLength(1);
      expect(result[0].getId().getValue()).toBe("123456");
      expect(result[0].getTitle()).toBe("Test Podcast");
      expect(result[0].getAuthor()).toBe("Test Author");
      expect(result[0].getDescription()).toBe("Test description");
      expect(result[0].getImage()).toBe("https://example.com/large.jpg");
    });

    it("handles missing summary gracefully", () => {
      const mockResponse = {
        feed: {
          entry: [
            {
              id: { attributes: { "im:id": "123456" } },
              "im:name": { label: "Test Podcast" },
              "im:artist": { label: "Test Author" },
              "im:image": [{ label: "https://example.com/image.jpg" }],
            },
          ],
        },
      };

      const result = ItunesMappers.mapTopPodcastsResponse(mockResponse);

      expect(result[0].getDescription()).toBe("");
    });
  });

  describe("mapLookupResponse", () => {
    it("maps iTunes lookup response to Podcast and Episodes", () => {
      const mockResponse = {
        results: [
          {
            collectionId: 123456,
            collectionName: "Test Podcast",
            artistName: "Test Author",
            artworkUrl600: "https://example.com/artwork.jpg",
            description: "Podcast description",
          },
          {
            trackId: 789,
            trackName: "Episode 1",
            description: "Episode description",
            releaseDate: "2024-01-15T10:00:00Z",
            trackTimeMillis: 3600000,
            episodeUrl: "https://example.com/episode1.mp3",
            kind: "podcast-episode",
          },
        ],
      };

      const result = ItunesMappers.mapLookupResponse(mockResponse, "123456");

      expect(result.podcast).not.toBeNull();
      expect(result.podcast?.getTitle()).toBe("Test Podcast");
      expect(result.podcast?.getAuthor()).toBe("Test Author");
      expect(result.podcast?.getEpisodeCount()).toBe(1);

      expect(result.episodes).toHaveLength(1);
      expect(result.episodes[0].getId()).toBe("789");
      expect(result.episodes[0].getTitle()).toBe("Episode 1");
      expect(result.episodes[0].getAudioUrl()).toBe(
        "https://example.com/episode1.mp3"
      );
    });

    it("returns null podcast and empty episodes for empty response", () => {
      const mockResponse = { results: [] };

      const result = ItunesMappers.mapLookupResponse(mockResponse, "123456");

      expect(result.podcast).toBeNull();
      expect(result.episodes).toHaveLength(0);
    });

    it("handles missing optional fields gracefully", () => {
      const mockResponse = {
        results: [
          {
            trackId: 789,
            trackName: "Episode 1",
            kind: "podcast-episode",
          },
        ],
      };

      const result = ItunesMappers.mapLookupResponse(mockResponse, "123456");

      expect(result.episodes[0].getDescription()).toBe("");
      expect(result.episodes[0].getAudioUrl()).toBeNull();
      expect(result.episodes[0].getDuration()).toBeNull();
    });
  });
});
