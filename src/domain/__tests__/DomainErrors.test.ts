import { describe, it, expect } from "vitest";
import {
  PodcastNotFoundError,
  EpisodeNotFoundError,
  InvalidPodcastIdError,
  DomainError,
} from "../errors/DomainError";

describe("Domain Errors", () => {
  describe("PodcastNotFoundError", () => {
    it("creates error with descriptive message", () => {
      const error = new PodcastNotFoundError("123456");
      expect(error.message).toBe("Podcast with ID 123456 not found");
      expect(error.name).toBe("PodcastNotFoundError");
      expect(error).toBeInstanceOf(DomainError);
    });
  });

  describe("EpisodeNotFoundError", () => {
    it("creates error with descriptive message without podcast ID", () => {
      const error = new EpisodeNotFoundError("ep123");
      expect(error.message).toBe("Episode with ID ep123 not found");
      expect(error.name).toBe("EpisodeNotFoundError");
    });

    it("creates error with descriptive message including podcast ID", () => {
      const error = new EpisodeNotFoundError("ep123", "podcast456");
      expect(error.message).toBe(
        "Episode with ID ep123 in podcast podcast456 not found"
      );
    });
  });

  describe("InvalidPodcastIdError", () => {
    it("creates error with descriptive message", () => {
      const error = new InvalidPodcastIdError("invalid-id");
      expect(error.message).toBe("Invalid podcast ID: invalid-id");
      expect(error.name).toBe("InvalidPodcastIdError");
    });
  });
});
