import { describe, it, expect } from "vitest";
import { Episode } from "../entities/Episode";

describe("Episode", () => {
  const validEpisodeData = {
    id: "ep123",
    title: "Test Episode",
    description: "Test Description",
    audioUrl: "https://example.com/audio.mp3",
    duration: 3661, // 1 hora, 1 minuto, 1 segundo
    publishedAt: "2024-01-15T10:00:00Z",
    podcastId: "123456",
  };

  describe("create", () => {
    it("crea un Episode válido", () => {
      const episode = Episode.create(validEpisodeData);
      expect(episode.getTitle()).toBe("Test Episode");
      expect(episode.getDuration()).toBe(3661);
      expect(episode.hasAudio()).toBe(true);
    });

    it("maneja campos opcionales como null", () => {
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
    it("devuelve true cuando hay URL de audio", () => {
      const episode = Episode.create(validEpisodeData);
      expect(episode.hasAudio()).toBe(true);
    });

    it("devuelve false cuando no hay URL de audio", () => {
      const episode = Episode.create({
        ...validEpisodeData,
        audioUrl: undefined,
      });
      expect(episode.hasAudio()).toBe(false);
    });

    it("devuelve false cuando la URL está vacía", () => {
      const episode = Episode.create({
        ...validEpisodeData,
        audioUrl: "",
      });
      expect(episode.hasAudio()).toBe(false);
    });
  });

  describe("getFormattedDuration", () => {
    it("formatea duración con horas, minutos y segundos", () => {
      const episode = Episode.create(validEpisodeData);
      expect(episode.getFormattedDuration()).toBe("1:01:01");
    });

    it("formatea duración solo con minutos y segundos", () => {
      const episode = Episode.create({
        ...validEpisodeData,
        duration: 125, // 2 minutos, 5 segundos
      });
      expect(episode.getFormattedDuration()).toBe("2:05");
    });

    it("devuelve --:-- cuando no hay duración", () => {
      const episode = Episode.create({
        ...validEpisodeData,
        duration: undefined,
      });
      expect(episode.getFormattedDuration()).toBe("--:--");
    });
  });

  describe("getFormattedDate", () => {
    it("formatea fecha en formato español", () => {
      const episode = Episode.create(validEpisodeData);
      expect(episode.getFormattedDate()).toBe("15/01/2024");
    });
  });
});
