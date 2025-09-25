import { render, screen, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PodcastProvider, usePodcast } from "../PodcastContext";
import { ApiResponse } from "../../types/podcast";

const mockApiResponse: ApiResponse = {
  feed: {
    entry: [
      {
        id: { attributes: { "im:id": "123" } },
        "im:name": { label: "Test Podcast" },
        "im:artist": { label: "Test Author" },
        "im:image": [{ label: "test.jpg", attributes: { height: "170" } }],
      },
    ],
  },
};

const TestComponent = () => {
  const { podcasts, loading, error, fetchPodcasts, clearError } = usePodcast();

  return (
    <div>
      <div data-testid="loading">{loading ? "loading" : "not-loading"}</div>
      <div data-testid="error">{error || "no-error"}</div>
      <div data-testid="count">{podcasts.length}</div>
      <button onClick={fetchPodcasts}>Refetch</button>
      <button onClick={clearError}>Clear Error</button>
    </div>
  );
};

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<PodcastProvider>{ui}</PodcastProvider>);
};

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockLocalStorage = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

describe("PodcastContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("throws error when used outside provider", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => render(<TestComponent />)).toThrow(
      "usePodcast must be used within a PodcastProvider"
    );

    consoleError.mockRestore();
  });

  it("fetches podcasts on mount", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    renderWithProvider(<TestComponent />);

    expect(screen.getByTestId("loading")).toHaveTextContent("loading");

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("not-loading");
    });

    expect(screen.getByTestId("count")).toHaveTextContent("1");
    expect(screen.getByTestId("error")).toHaveTextContent("no-error");
  });

  it("handles fetch errors", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    renderWithProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent("Network error");
    });

    expect(screen.getByTestId("loading")).toHaveTextContent("not-loading");
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("handles HTTP errors", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    renderWithProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent("HTTP 404");
    });
  });

  it("uses cached data when available and fresh", async () => {
    const cacheData = {
      data: mockApiResponse,
      timestamp: Date.now() - 1000, // 1 second ago
    };

    mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(cacheData));

    renderWithProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId("count")).toHaveTextContent("1");
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("fetches fresh data when cache is expired", async () => {
    const expiredCacheData = {
      data: mockApiResponse,
      timestamp: Date.now() - 25 * 60 * 60 * 1000, // 25 hours ago
    };

    mockLocalStorage.getItem.mockReturnValueOnce(
      JSON.stringify(expiredCacheData)
    );
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    renderWithProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId("count")).toHaveTextContent("1");
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("handles malformed cache data gracefully", async () => {
    mockLocalStorage.getItem.mockReturnValueOnce("invalid-json");
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    renderWithProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId("count")).toHaveTextContent("1");
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("saves data to cache after successful fetch", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    renderWithProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId("count")).toHaveTextContent("1");
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      "podcast-cache",
      expect.stringContaining('"data"')
    );
  });

  it("clears errors", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Test error"));

    renderWithProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent("Test error");
    });

    act(() => {
      screen.getByText("Clear Error").click();
    });

    expect(screen.getByTestId("error")).toHaveTextContent("no-error");
  });

  it("allows manual refetch", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            feed: {
              entry: [
                mockApiResponse.feed!.entry![0],
                mockApiResponse.feed!.entry![0],
              ],
            },
          }),
      });

    renderWithProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId("count")).toHaveTextContent("1");
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("handles localStorage unavailability gracefully", async () => {
    const originalSetItem = mockLocalStorage.setItem;
    mockLocalStorage.setItem.mockImplementationOnce(() => {
      throw new Error("Storage unavailable");
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    renderWithProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId("count")).toHaveTextContent("1");
    });

    mockLocalStorage.setItem.mockImplementation(originalSetItem);
  });
});
