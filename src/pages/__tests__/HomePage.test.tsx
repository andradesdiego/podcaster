import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { HomePage } from "../HomePage";
import { ApiResponse } from "../../types/podcast";

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock data similar to iTunes API response
const mockApiResponse: ApiResponse = {
  feed: {
    entry: [
      {
        id: { attributes: { "im:id": "123" } },
        "im:name": { label: "Test Podcast 1" },
        "im:artist": { label: "Test Author 1" },
        "im:image": [
          { label: "small.jpg", attributes: { height: "55" } },
          { label: "medium.jpg", attributes: { height: "170" } },
          { label: "large.jpg", attributes: { height: "600" } },
        ],
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

describe("HomePage", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state initially", () => {
    // Mock a delayed response
    mockFetch.mockImplementation(() => new Promise(() => {}));

    render(<HomePage />);

    expect(screen.getByText("Cargando podcasts...")).toBeInTheDocument();
  });

  it("renders podcasts when API call succeeds", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    render(<HomePage />);

    // Wait for loading to finish and content to appear
    await waitFor(() => {
      expect(
        screen.queryByText("Cargando podcasts...")
      ).not.toBeInTheDocument();
    });

    // Check that podcasts are rendered
    expect(screen.getByText("TEST PODCAST 1")).toBeInTheDocument(); // Uppercase
    expect(screen.getByText("TEST PODCAST 2")).toBeInTheDocument();
    expect(screen.getByText("Author: Test Author 1")).toBeInTheDocument();
    expect(screen.getByText("Author: Test Author 2")).toBeInTheDocument();
  });

  it("shows results count when podcasts load", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  it("shows error message when API call fails", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<HomePage />);

    await waitFor(() => {
      expect(
        screen.getByText(/Error al cargar los podcasts: Network error/)
      ).toBeInTheDocument();
    });

    // Should not show loading or content
    expect(screen.queryByText("Cargando podcasts...")).not.toBeInTheDocument();
    expect(screen.queryByText("TEST PODCAST 1")).not.toBeInTheDocument();
  });

  it("shows error message when API returns error status", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    render(<HomePage />);

    await waitFor(() => {
      expect(
        screen.getByText(/Error al cargar los podcasts: HTTP 404/)
      ).toBeInTheDocument();
    });
  });

  it("handles empty podcast data gracefully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ feed: { entry: [] } }),
    });

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("0")).toBeInTheDocument();
    });

    // Should not show any podcast cards
    expect(screen.queryByText("TEST PODCAST 1")).not.toBeInTheDocument();
  });

  it("handles malformed API response gracefully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}), // Empty object
    });

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("0")).toBeInTheDocument();
    });
  });

  it("calls correct API endpoint", () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));

    render(<HomePage />);

    expect(mockFetch).toHaveBeenCalledWith(
      "/rss/toppodcasts/limit=100/genre=1310/json"
    );
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("selects correct image size (170px preferred)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    render(<HomePage />);

    await waitFor(() => {
      const image = screen.getByAltText("TEST PODCAST 1 podcast cover");
      expect(image).toHaveAttribute("src", "medium.jpg"); // The 170px image
    });
  });

  it("falls back to last image when 170px not available", async () => {
    const mockDataWithoutMedium: ApiResponse = {
      feed: {
        entry: [
          {
            id: { attributes: { "im:id": "789" } },
            "im:name": { label: "Test Podcast 3" },
            "im:artist": { label: "Test Author 3" },
            "im:image": [
              { label: "small.jpg", attributes: { height: "55" } },
              { label: "large.jpg", attributes: { height: "600" } },
            ],
          },
        ],
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockDataWithoutMedium),
    });

    render(<HomePage />);

    await waitFor(() => {
      const image = screen.getByAltText("TEST PODCAST 3 podcast cover");
      expect(image).toHaveAttribute("src", "large.jpg"); // Falls back to last image
    });
  });
});
