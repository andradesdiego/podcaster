import { describe, it, expect, beforeEach, vi } from "vitest";
import { LocalStorageCacheRepository } from "../cache/LocalStorageCacheRepository";

const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

describe("LocalStorageCacheRepository", () => {
  let repository: LocalStorageCacheRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new LocalStorageCacheRepository();
  });

  describe("get", () => {
    it("returns parsed JSON value from localStorage", () => {
      const testData = { id: "1", name: "test" };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testData));

      const result = repository.get<typeof testData>("test-key");

      expect(result).toEqual(testData);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith("test-key");
    });

    it("returns null when item does not exist", () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = repository.get("non-existent-key");

      expect(result).toBeNull();
    });

    it("returns null when JSON parsing fails", () => {
      mockLocalStorage.getItem.mockReturnValue("invalid-json");

      const result = repository.get("invalid-key");

      expect(result).toBeNull();
    });
  });

  describe("set", () => {
    it("stores value and TTL in localStorage", () => {
      const testData = { id: "1", name: "test" };
      const mockNow = 1000000;
      vi.spyOn(Date, "now").mockReturnValue(mockNow);

      repository.set("test-key", testData, 24);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "test-key",
        JSON.stringify(testData)
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "test-key_ttl",
        (mockNow + 24 * 60 * 60 * 1000).toString()
      );
    });

    it("uses default TTL of 24 hours when not specified", () => {
      const testData = { id: "1" };
      const mockNow = 1000000;
      vi.spyOn(Date, "now").mockReturnValue(mockNow);

      repository.set("test-key", testData);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "test-key_ttl",
        (mockNow + 24 * 60 * 60 * 1000).toString()
      );
    });

    it("handles localStorage errors gracefully", () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error("Storage full");
      });
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      expect(() => repository.set("test-key", { data: "test" })).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to save to localStorage:",
        expect.any(Error)
      );
    });
  });

  describe("isExpired", () => {
    it("returns true when TTL key does not exist", () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = repository.isExpired("test-key");

      expect(result).toBe(true);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith("test-key_ttl");
    });

    it("returns true when current time exceeds expiration time", () => {
      const expiredTime = 1000000;
      const currentTime = 2000000;
      mockLocalStorage.getItem.mockReturnValue(expiredTime.toString());
      vi.spyOn(Date, "now").mockReturnValue(currentTime);

      const result = repository.isExpired("test-key");

      expect(result).toBe(true);
    });

    it("returns false when current time is before expiration time", () => {
      const futureTime = 2000000;
      const currentTime = 1000000;
      mockLocalStorage.getItem.mockReturnValue(futureTime.toString());
      vi.spyOn(Date, "now").mockReturnValue(currentTime);

      const result = repository.isExpired("test-key");

      expect(result).toBe(false);
    });
  });

  describe("clear", () => {
    it("removes both data and TTL keys from localStorage", () => {
      repository.clear("test-key");

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("test-key");
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("test-key_ttl");
    });
  });
});
