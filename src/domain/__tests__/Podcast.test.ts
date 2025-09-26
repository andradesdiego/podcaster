import { describe, it, expect } from "vitest";
import { Podcast } from "../entities/Podcast";

describe("Podcast", () => {
  const validPodcastData = {
    id: "123456",
    title: "Test Podcast",
    author: "Test Author",
    description: "Test Description",
    image: "https://example.com/image55x55bb.jpg",
    episodeCount: 10,
  };

  describe("create", () => {
    it("creates valid Podcast", () => {
      const podcast = Podcast.create(validPodcastData);
      expect(podcast.getTitle()).toBe("Test Podcast");
      expect(podcast.getAuthor()).toBe("Test Author");
      expect(podcast.getEpisodeCount()).toBe(10);
    });

    it("trims whitespace from text fields", () => {
      const podcast = Podcast.create({
        ...validPodcastData,
        title: "  Test Podcast  ",
        author: "  Test Author  ",
      });
      expect(podcast.getTitle()).toBe("Test Podcast");
      expect(podcast.getAuthor()).toBe("Test Author");
    });

    it("assigns 0 episodes by default if not provided", () => {
      const { episodeCount, ...dataWithoutEpisodes } = validPodcastData;
      const podcast = Podcast.create(dataWithoutEpisodes);
      expect(podcast.getEpisodeCount()).toBe(0);
    });
  });

  describe("getBestImageUrl", () => {
    it("replaces 55x55bb with 600x600bb for better quality", () => {
      const podcast = Podcast.create(validPodcastData);
      expect(podcast.getBestImageUrl()).toBe(
        "https://example.com/image600x600bb.jpg"
      );
    });

    it("returns original URL if it does not contain 55x55bb", () => {
      const podcast = Podcast.create({
        ...validPodcastData,
        image: "https://example.com/other-image.jpg",
      });
      expect(podcast.getBestImageUrl()).toBe(
        "https://example.com/other-image.jpg"
      );
    });
  });

  describe("matches", () => {
    const podcast = Podcast.create(validPodcastData);

    it("returns true for empty search", () => {
      expect(podcast.matches("")).toBe(true);
      expect(podcast.matches("   ")).toBe(true);
    });

    it("finds match in title (case insensitive)", () => {
      expect(podcast.matches("test")).toBe(true);
      expect(podcast.matches("TEST")).toBe(true);
      expect(podcast.matches("podcast")).toBe(true);
    });

    it("finds match in author (case insensitive)", () => {
      expect(podcast.matches("author")).toBe(true);
      expect(podcast.matches("AUTHOR")).toBe(true);
    });

    it("returns false for terms without match", () => {
      expect(podcast.matches("javascript")).toBe(false);
      expect(podcast.matches("react")).toBe(false);
    });
  });

  describe("toDisplayName", () => {
    it("combines title and author", () => {
      const podcast = Podcast.create(validPodcastData);
      expect(podcast.toDisplayName()).toBe("Test Podcast - Test Author");
    });
  });

  describe("toPlainObject", () => {
    it("converts to plain object for compatibility", () => {
      const podcast = Podcast.create(validPodcastData);
      const plain = podcast.toPlainObject();
      expect(plain).toEqual(validPodcastData);
    });
  });
});
