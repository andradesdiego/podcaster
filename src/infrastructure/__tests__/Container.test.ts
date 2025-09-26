import { describe, it, expect } from "vitest";
import { Container } from "../di/Container";
import { PodcastService } from "../../application/services/PodcastService";
import { ItunesPodcastRepository } from "../repositories/ItunesPodcastRepository";
import { LocalStorageCacheRepository } from "../cache/LocalStorageCacheRepository";

describe("Container", () => {
  describe("getInstance", () => {
    it("returns singleton instance", () => {
      const container1 = Container.getInstance();
      const container2 = Container.getInstance();

      expect(container1).toBe(container2);
    });
  });

  describe("service registration", () => {
    it("registers and retrieves PodcastService", () => {
      const container = Container.getInstance();

      const service = container.get<PodcastService>("PodcastService");

      expect(service).toBeInstanceOf(PodcastService);
    });

    it("provides convenience method for PodcastService", () => {
      const container = Container.getInstance();

      const service = container.getPodcastService();

      expect(service).toBeInstanceOf(PodcastService);
    });

    it("registers repository implementations", () => {
      const container = Container.getInstance();

      const podcastRepo = container.get("PodcastRepository");
      const cacheRepo = container.get("CacheRepository");

      expect(podcastRepo).toBeInstanceOf(ItunesPodcastRepository);
      expect(cacheRepo).toBeInstanceOf(LocalStorageCacheRepository);
    });

    it("throws error for unknown service", () => {
      const container = Container.getInstance();

      expect(() => container.get("UnknownService")).toThrow(
        "Service UnknownService not found"
      );
    });
  });
});
