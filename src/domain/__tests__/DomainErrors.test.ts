import { describe, it, expect } from "vitest";
import {
  PodcastNotFoundError,
  EpisodeNotFoundError,
  InvalidPodcastIdError,
  DomainError,
} from "../errors/DomainError";

describe("Domain Errors", () => {
  describe("PodcastNotFoundError", () => {
    it("crea error con mensaje descriptivo", () => {
      const error = new PodcastNotFoundError("123456");
      expect(error.message).toBe("Podcast con ID 123456 no encontrado");
      expect(error.name).toBe("PodcastNotFoundError");
      expect(error).toBeInstanceOf(DomainError);
    });
  });

  describe("EpisodeNotFoundError", () => {
    it("crea error con mensaje descriptivo sin podcast ID", () => {
      const error = new EpisodeNotFoundError("ep123");
      expect(error.message).toBe("Episodio con ID ep123 no encontrado");
      expect(error.name).toBe("EpisodeNotFoundError");
    });

    it("crea error con mensaje descriptivo incluyendo podcast ID", () => {
      const error = new EpisodeNotFoundError("ep123", "podcast456");
      expect(error.message).toBe(
        "Episodio con ID ep123 en podcast podcast456 no encontrado"
      );
    });
  });

  describe("InvalidPodcastIdError", () => {
    it("crea error con mensaje descriptivo", () => {
      const error = new InvalidPodcastIdError("invalid-id");
      expect(error.message).toBe("ID de podcast inválido: invalid-id");
      expect(error.name).toBe("InvalidPodcastIdError");
    });
  });
});
