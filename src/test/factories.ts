import { vi } from "vitest";
import { PodcastEntry, ApiResponse } from "../types/podcast";

// Mock del fetch global para reutilizar
export const mockFetchSuccess = (data: ApiResponse) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(data),
  });
};

export const mockFetchError = (error: Error) => {
  global.fetch = vi.fn().mockRejectedValue(error);
};

export const mockFetchHttpError = (status: number) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status,
  });
};

// Data factory para tests
export const createMockPodcast = (
  id: string,
  name: string,
  author: string
): PodcastEntry => ({
  id: { attributes: { "im:id": id } },
  "im:name": { label: name },
  "im:artist": { label: author },
  "im:image": [{ label: `${id}-170.jpg`, attributes: { height: "170" } }],
});

export const createMockApiResponse = (
  podcasts: PodcastEntry[]
): ApiResponse => ({
  feed: {
    entry: podcasts,
  },
});
