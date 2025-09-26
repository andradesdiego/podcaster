import { describe, it, expect } from "vitest";
import { Episode } from "../entities/Episode";

describe("Episode", () => {
  const validEpisodeData = {
    id: "ep123",
    title: "Test Episode",
    description: "Test Description",
    audioUrl: "https://example.com/audio.mp3",
    duration: 3661, // 1 hour, 1 minute, 1 second
    publishedAt: "2024-01-15T10:00:00Z",
    podcastId: "123456",
  };

  describe("create", () => {
    it("creates valid Episode", () => {
      const episode = Episode.create(validEpisodeData);
      expect(episode.getTitle()).toBe("Test Episode");
      expect(episode.getDuration()).toBe(3661);
      expect(episode.hasAudio()).toBe(true);
    });

    it("handles optional fields as null", () => {
      const episode = Episode.create({
        ...validEpisodeData,
        audioUrl: undefined,
        duration: undefined,
      });
      expect(episode.getAudioUrl()).toBeNull();
      expect(episode.getDuration()).toBeNull();
      expect(episode.hasAudio()).toBe(false);
    });
  });

  describe("hasAudio", () => {
    it("returns true when audio URL exists", () => {
      const episode = Episode.create(validEpisodeData);
      expect(episode.hasAudio()).toBe(true);
    });

    it("returns false when no audio URL", () => {
      const episode = Episode.create({
        ...validEpisodeData,
        audioUrl: undefined,
      });
      expect(episode.hasAudio()).toBe(false);
    });

    it("returns false when URL is empty", () => {
      const episode = Episode.create({
        ...validEpisodeData,
        audioUrl: "",
      });
      expect(episode.hasAudio()).toBe(false);
    });
  });

  describe("getFormattedDuration", () => {
    it("formats duration with hours, minutes and seconds", () => {
      const episode = Episode.create(validEpisodeData);
      expect(episode.getFormattedDuration()).toBe("1:01:01");
    });

    it("formats duration with only minutes and seconds", () => {
      const episode = Episode.create({
        ...validEpisodeData,
        duration: 125, // 2 minutes, 5 seconds
      });
      expect(episode.getFormattedDuration()).toBe("2:05");
    });

    it("returns --:-- when no duration", () => {
      const episode = Episode.create({
        ...validEpisodeData,
        duration: undefined,
      });
      expect(episode.getFormattedDuration()).toBe("--:--");
    });
  });

  describe("getFormattedDate", () => {
    it("formats date in Spanish format", () => {
      const episode = Episode.create(validEpisodeData);
      expect(episode.getFormattedDate()).toBe("15/01/2024");
    });
  });
});
