import { describe, it, expect } from "vitest";
import { PodcastId } from "../value-objects/PodcastId";

describe("PodcastId", () => {
  describe("create", () => {
    it("creates valid PodcastId with numeric string", () => {
      const id = PodcastId.create("123456");
      expect(id.getValue()).toBe("123456");
    });

    it("creates valid PodcastId with number", () => {
      const id = PodcastId.create(123456);
      expect(id.getValue()).toBe("123456");
    });

    it("trims whitespace", () => {
      const id = PodcastId.create("  123456  ");
      expect(id.getValue()).toBe("123456");
    });

    it("throws error with empty string", () => {
      expect(() => PodcastId.create("")).toThrow("PodcastId cannot be empty");
    });

    it("throws error with non-numeric string", () => {
      expect(() => PodcastId.create("abc123")).toThrow(
        "PodcastId must be numeric"
      );
    });

    it("throws error with only spaces", () => {
      expect(() => PodcastId.create("   ")).toThrow(
        "PodcastId cannot be empty"
      );
    });
  });

  describe("equals", () => {
    it("returns true for equal IDs", () => {
      const id1 = PodcastId.create("123456");
      const id2 = PodcastId.create("123456");
      expect(id1.equals(id2)).toBe(true);
    });

    it("returns false for different IDs", () => {
      const id1 = PodcastId.create("123456");
      const id2 = PodcastId.create("789012");
      expect(id1.equals(id2)).toBe(false);
    });
  });
});
