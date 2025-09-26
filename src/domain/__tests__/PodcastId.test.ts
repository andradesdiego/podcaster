import { describe, it, expect } from "vitest";
import { PodcastId } from "../value-objects/PodcastId";

describe("PodcastId", () => {
  describe("create", () => {
    it("crea un PodcastId válido con string numérico", () => {
      const id = PodcastId.create("123456");
      expect(id.getValue()).toBe("123456");
    });

    it("crea un PodcastId válido con número", () => {
      const id = PodcastId.create(123456);
      expect(id.getValue()).toBe("123456");
    });

    it("elimina espacios en blanco", () => {
      const id = PodcastId.create("  123456  ");
      expect(id.getValue()).toBe("123456");
    });

    it("lanza error con string vacío", () => {
      expect(() => PodcastId.create("")).toThrow(
        "PodcastId no puede estar vacío"
      );
    });

    it("lanza error con string no numérico", () => {
      expect(() => PodcastId.create("abc123")).toThrow(
        "PodcastId debe ser numérico"
      );
    });

    it("lanza error con solo espacios", () => {
      expect(() => PodcastId.create("   ")).toThrow(
        "PodcastId no puede estar vacío"
      );
    });
  });

  describe("equals", () => {
    it("devuelve true para IDs iguales", () => {
      const id1 = PodcastId.create("123456");
      const id2 = PodcastId.create("123456");
      expect(id1.equals(id2)).toBe(true);
    });

    it("devuelve false para IDs diferentes", () => {
      const id1 = PodcastId.create("123456");
      const id2 = PodcastId.create("789012");
      expect(id1.equals(id2)).toBe(false);
    });
  });
});
