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
    it("crea un Podcast válido", () => {
      const podcast = Podcast.create(validPodcastData);
      expect(podcast.getTitle()).toBe("Test Podcast");
      expect(podcast.getAuthor()).toBe("Test Author");
      expect(podcast.getEpisodeCount()).toBe(10);
    });

    it("elimina espacios en blanco de los campos de texto", () => {
      const podcast = Podcast.create({
        ...validPodcastData,
        title: "  Test Podcast  ",
        author: "  Test Author  ",
      });
      expect(podcast.getTitle()).toBe("Test Podcast");
      expect(podcast.getAuthor()).toBe("Test Author");
    });

    it("asigna 0 episodios por defecto si no se proporciona", () => {
      const { episodeCount, ...dataWithoutEpisodes } = validPodcastData;
      const podcast = Podcast.create(dataWithoutEpisodes);
      expect(podcast.getEpisodeCount()).toBe(0);
    });
  });

  describe("getBestImageUrl", () => {
    it("reemplaza 55x55bb por 600x600bb para mejor calidad", () => {
      const podcast = Podcast.create(validPodcastData);
      expect(podcast.getBestImageUrl()).toBe(
        "https://example.com/image600x600bb.jpg"
      );
    });

    it("devuelve la URL original si no contiene 55x55bb", () => {
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

    it("devuelve true para búsqueda vacía", () => {
      expect(podcast.matches("")).toBe(true);
      expect(podcast.matches("   ")).toBe(true);
    });

    it("encuentra coincidencia en el título (case insensitive)", () => {
      expect(podcast.matches("test")).toBe(true);
      expect(podcast.matches("TEST")).toBe(true);
      expect(podcast.matches("podcast")).toBe(true);
    });

    it("encuentra coincidencia en el autor (case insensitive)", () => {
      expect(podcast.matches("author")).toBe(true);
      expect(podcast.matches("AUTHOR")).toBe(true);
    });

    it("devuelve false para términos sin coincidencia", () => {
      expect(podcast.matches("javascript")).toBe(false);
      expect(podcast.matches("react")).toBe(false);
    });
  });

  describe("toDisplayName", () => {
    it("combina título y autor", () => {
      const podcast = Podcast.create(validPodcastData);
      expect(podcast.toDisplayName()).toBe("Test Podcast - Test Author");
    });
  });

  describe("toPlainObject", () => {
    it("convierte a objeto plano para compatibilidad", () => {
      const podcast = Podcast.create(validPodcastData);
      const plain = podcast.toPlainObject();
      expect(plain).toEqual(validPodcastData);
    });
  });
});
