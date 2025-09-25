import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { HomePage } from "../HomePage";
import { PodcastProvider } from "../../context/PodcastContext";
import { ApiResponse } from "../../types/podcast";

const mockApiResponse: ApiResponse = {
  feed: {
    entry: [
      {
        id: { attributes: { "im:id": "123" } },
        "im:name": { label: "Test Podcast 1" },
        "im:artist": { label: "Test Author 1" },
        "im:image": [{ label: "medium.jpg", attributes: { height: "170" } }],
      },
      {
        id: { attributes: { "im:id": "456" } },
        "im:name": { label: "Test Podcast 2" },
        "im:artist": { label: "Test Author 2" },
        "im:image": [{ label: "test2.jpg", attributes: { height: "170" } }],
      },
    ],
  },
};

const mockLocalStorage = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

const mockFetch = vi.fn();
global.fetch = mockFetch;

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<PodcastProvider>{ui}</PodcastProvider>);
};

describe("HomePage with Context", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
  });

  it("shows loading state initially", async () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));

    renderWithProvider(<HomePage />);

    expect(screen.getByText("Loading podcasts...")).toBeInTheDocument();
  });

  it("renders podcasts when loaded successfully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    renderWithProvider(<HomePage />);

    await waitFor(() => {
      expect(screen.queryByText("Loading podcasts...")).not.toBeInTheDocument();
    });

    expect(screen.getByText("TEST PODCAST 1")).toBeInTheDocument();
    expect(screen.getByText("TEST PODCAST 2")).toBeInTheDocument();
    expect(screen.getByText("Author: Test Author 1")).toBeInTheDocument();
    expect(screen.getByText("Author: Test Author 2")).toBeInTheDocument();
  });

  it("shows results count correctly", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    renderWithProvider(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  it("shows error message when fetch fails", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    renderWithProvider(<HomePage />);

    await waitFor(() => {
      expect(
        screen.getByText(/Error loading podcasts: Network error/)
      ).toBeInTheDocument();
    });

    expect(screen.queryByText("Loading podcasts...")).not.toBeInTheDocument();
  });

  it("uses cached data when available", async () => {
    const cacheData = {
      data: mockApiResponse,
      timestamp: Date.now() - 1000,
    };

    mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(cacheData));

    renderWithProvider(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("TEST PODCAST 1")).toBeInTheDocument();
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("search functionality works with context data", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    renderWithProvider(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("TEST PODCAST 1")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Filter podcasts...");

    await waitFor(() => {
      expect(searchInput).not.toBeDisabled();
    });
  });

  it("handles empty podcast data gracefully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ feed: { entry: [] } }),
    });

    renderWithProvider(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("0")).toBeInTheDocument();
    });
  });

  it("calls correct API endpoint", async () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));

    renderWithProvider(<HomePage />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/rss/toppodcasts/limit=100/genre=1310/json"
      );
    });
  });
});
