// src/hooks/__tests__/usePodcastService.test.ts
import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { usePodcastService } from "../usePodcastService";
import { PodcastListDTO } from "../../application/dto/PodcastDTO";

const mockPodcastService = {
  getTopPodcasts: vi.fn(),
  filterPodcasts: vi.fn(),
};

const mockContainer = {
  getPodcastService: vi.fn(() => mockPodcastService),
};

vi.mock("../../infrastructure/di/Container", () => ({
  Container: {
    getInstance: vi.fn(() => mockContainer),
  },
}));

const mockPodcastDTOs = [
  {
    id: "123",
    title: "JavaScript Podcast",
    author: "John Doe",
    image: "image1.jpg",
  },
  {
    id: "456",
    title: "React Show",
    author: "Jane Smith",
    image: "image2.jpg",
  },
];

describe("usePodcastService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPodcastService.getTopPodcasts.mockResolvedValue(mockPodcastDTOs);
    mockPodcastService.filterPodcasts.mockImplementation(
      (podcasts: PodcastListDTO[], search: string) =>
        search
          ? podcasts.filter((p: PodcastListDTO) =>
              p.title.toLowerCase().includes(search.toLowerCase())
            )
          : podcasts
    );
  });

  it("should initialize with correct default state", async () => {
    const { result } = renderHook(() => usePodcastService());

    // El hook inicia loading=true inmediatamente por el useEffect
    expect(result.current.podcasts).toEqual([]);
    expect(result.current.loading).toBe(true); // ← Cambiar a true
    expect(result.current.error).toBe(null);
    expect(typeof result.current.filterPodcasts).toBe("function");

    // Esperar a que termine la carga
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("should load podcasts on mount and convert DTOs to PodcastEntry format", async () => {
    const { result } = renderHook(() => usePodcastService());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockPodcastService.getTopPodcasts).toHaveBeenCalledTimes(1);
    expect(result.current.podcasts).toHaveLength(2);
    expect(result.current.error).toBe(null);

    const firstPodcast = result.current.podcasts[0];
    expect(firstPodcast).toEqual({
      id: {
        attributes: {
          "im:id": "123",
        },
      },
      "im:name": {
        label: "JavaScript Podcast",
      },
      "im:artist": {
        label: "John Doe",
      },
      "im:image": [
        {
          label: "image1.jpg",
          attributes: {
            height: "170",
          },
        },
      ],
    });
  });

  it("should handle loading errors correctly", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockPodcastService.getTopPodcasts.mockRejectedValue(
      new Error("Network error")
    );

    const { result } = renderHook(() => usePodcastService());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.podcasts).toEqual([]);
    expect(result.current.error).toBe("Network error");
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error loading podcasts:",
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it("should filter podcasts correctly using service", async () => {
    const { result } = renderHook(() => usePodcastService());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      const filtered = result.current.filterPodcasts("JavaScript");
      expect(mockPodcastService.filterPodcasts).toHaveBeenCalledWith(
        mockPodcastDTOs,
        "JavaScript"
      );
      expect(filtered).toHaveLength(1);
      expect(filtered[0]["im:name"].label).toBe("JavaScript Podcast");
    });
  });

  it("should return all podcasts when search term is empty", async () => {
    const { result } = renderHook(() => usePodcastService());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      const filtered = result.current.filterPodcasts("");
      expect(filtered).toEqual(result.current.podcasts);
      expect(mockPodcastService.filterPodcasts).not.toHaveBeenCalled();
    });
  });

  it("should return all podcasts when search term is only whitespace", async () => {
    const { result } = renderHook(() => usePodcastService());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      const filtered = result.current.filterPodcasts("   ");
      expect(filtered).toEqual(result.current.podcasts);
      expect(mockPodcastService.filterPodcasts).not.toHaveBeenCalled();
    });
  });

  it("should convert filtered DTOs back to PodcastEntry format", async () => {
    const { result } = renderHook(() => usePodcastService());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      const filtered = result.current.filterPodcasts("React");
      expect(filtered).toHaveLength(1);
      expect(filtered[0]).toEqual({
        id: {
          attributes: {
            "im:id": "456",
          },
        },
        "im:name": {
          label: "React Show",
        },
        "im:artist": {
          label: "Jane Smith",
        },
        "im:image": [
          {
            label: "image2.jpg",
            attributes: {
              height: "170",
            },
          },
        ],
      });
    });
  });

  it("should handle missing image gracefully", async () => {
    const podcastWithoutImage = [
      {
        id: "789",
        title: "Vue Podcast",
        author: "Vue Dev",
        image: "",
      },
    ];

    mockPodcastService.getTopPodcasts.mockResolvedValue(podcastWithoutImage);

    const { result } = renderHook(() => usePodcastService());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.podcasts[0]["im:image"][0].label).toBe("");
  });
});
