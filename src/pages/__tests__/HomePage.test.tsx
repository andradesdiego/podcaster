// src/pages/__tests__/HomePage.test.tsx
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { HomePage } from "../HomePage";
import { PodcastListDTO } from "../../application/dto/PodcastDTO";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockPodcastService = {
  getTopPodcasts: vi.fn(),
  filterPodcasts: vi.fn(),
};

vi.mock("../../infrastructure/di/Container", () => ({
  Container: {
    getInstance: () => ({
      getPodcastService: () => mockPodcastService,
    }),
  },
}));

const mockPodcastDTOs = [
  {
    id: "123",
    title: "Test Podcast 1",
    author: "Test Author 1",
    image: "medium.jpg",
  },
  {
    id: "456",
    title: "Test Podcast 2",
    author: "Test Author 2",
    image: "test2.jpg",
  },
];

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

describe("HomePage with Navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();

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

  it("renders podcasts and handles navigation", async () => {
    renderWithRouter(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("TEST PODCAST 1")).toBeInTheDocument();
      expect(screen.getByText("TEST PODCAST 2")).toBeInTheDocument();
    });

    expect(mockPodcastService.getTopPodcasts).toHaveBeenCalledTimes(1);

    const firstPodcastCard = screen.getByText("TEST PODCAST 1").closest("li");
    fireEvent.click(firstPodcastCard!);

    expect(mockNavigate).toHaveBeenCalledWith("/podcast/123");
  });

  it("navigates to correct podcast detail page", async () => {
    renderWithRouter(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("TEST PODCAST 2")).toBeInTheDocument();
    });

    const secondPodcastCard = screen.getByText("TEST PODCAST 2").closest("li");
    fireEvent.click(secondPodcastCard!);

    expect(mockNavigate).toHaveBeenCalledWith("/podcast/456");
  });

  it("shows results count correctly", async () => {
    renderWithRouter(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  it("search functionality still works", async () => {
    renderWithRouter(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("TEST PODCAST 1")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Filter podcasts...");
    fireEvent.change(searchInput, { target: { value: "Test Podcast 1" } });

    await waitFor(() => {
      expect(mockPodcastService.filterPodcasts).toHaveBeenCalledWith(
        mockPodcastDTOs,
        "Test Podcast 1"
      );
    });

    expect(searchInput).not.toBeDisabled();
  });

  it("handles loading state", () => {
    mockPodcastService.getTopPodcasts.mockImplementation(
      () => new Promise(() => {})
    );

    renderWithRouter(<HomePage />);

    expect(screen.getByText("Loading podcasts...")).toBeInTheDocument();
  });

  it("handles error state", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockPodcastService.getTopPodcasts.mockRejectedValue(
      new Error("Network error")
    );

    renderWithRouter(<HomePage />);

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        "Error loading podcasts:",
        expect.any(Error)
      );
    });

    consoleError.mockRestore();
  });
});
