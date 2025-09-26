import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { HomePage } from "../HomePage";
import { PodcastProvider } from "../../context/PodcastContext";
import { ApiResponse } from "../../types/podcast";

const mockApiResponse: ApiResponse = {
  feed: {
    entry: [
      {
        id: { attributes: { "im:id": "123" } },
        "im:name": { label: "Test Podcast 1" },
        "im:artist": { label: "Author: Test Author 1" },
        "im:image": [{ label: "medium.jpg", attributes: { height: "170" } }],
      },
      {
        id: { attributes: { "im:id": "456" } },
        "im:name": { label: "Test Podcast 2" },
        "im:artist": { label: "Author: Test Author 2" },
        "im:image": [{ label: "test2.jpg", attributes: { height: "170" } }],
      },
    ],
  },
};

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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

const renderWithRouter = (ui: React.ReactElement) => {
  return render(
    <MemoryRouter>
      <PodcastProvider>{ui}</PodcastProvider>
    </MemoryRouter>
  );
};

describe("HomePage with Navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
    mockNavigate.mockClear();
  });

  it("renders podcasts and handles navigation", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    renderWithRouter(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("TEST PODCAST 1")).toBeInTheDocument();
    });

    const firstPodcastCard = screen.getByText("TEST PODCAST 1").closest("li");
    fireEvent.click(firstPodcastCard!);

    expect(mockNavigate).toHaveBeenCalledWith("/podcast/123");
  });

  it("navigates to correct podcast detail page", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    renderWithRouter(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("TEST PODCAST 2")).toBeInTheDocument();
    });

    const secondPodcastCard = screen.getByText("TEST PODCAST 2").closest("li");
    fireEvent.click(secondPodcastCard!);

    expect(mockNavigate).toHaveBeenCalledWith("/podcast/456");
  });

  it("shows results count correctly", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    renderWithRouter(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  it("search functionality still works", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    renderWithRouter(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("TEST PODCAST 1")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Filter podcasts...");
    expect(searchInput).not.toBeDisabled();
  });
});
