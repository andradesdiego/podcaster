import { describe, it, expect, beforeEach, vi } from "vitest";
import { FetchHttpClient } from "../http/HttpClient";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("FetchHttpClient", () => {
  let httpClient: FetchHttpClient;

  beforeEach(() => {
    vi.clearAllMocks();
    httpClient = new FetchHttpClient();
  });

  describe("get", () => {
    it("makes successful HTTP request and returns JSON", async () => {
      const mockData = { id: 1, name: "test" };
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockData),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await httpClient.get("https://api.example.com/data");

      expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/data");
      expect(result).toEqual(mockData);
    });

    it("throws error when response is not ok", async () => {
      const mockResponse = {
        ok: false,
        status: 404,
      };
      mockFetch.mockResolvedValue(mockResponse);

      await expect(
        httpClient.get("https://api.example.com/notfound")
      ).rejects.toThrow("HTTP error! status: 404");
    });

    it("propagates fetch errors", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      await expect(
        httpClient.get("https://api.example.com/data")
      ).rejects.toThrow("Network error");
    });
  });
});
