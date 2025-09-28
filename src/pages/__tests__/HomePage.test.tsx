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

// Mock del Context API
let mockPodcastContextValue = {
  podcasts: [] as PodcastListDTO[],
  loading: false,
  error: null as string | null,
};

vi.mock("../../context/PodcastContext", () => ({
  usePodcast: () => mockPodcastContextValue,
}));

// Mock del Container para filterPodcasts
const mockPodcastService = {
  filterPodcasts: vi.fn(),
};

vi.mock("../../infrastructure/di/Container", () => ({
  Container: {
    getInstance: () => ({
      getPodcastService: () => mockPodcastService,
    }),
  },
}));

const mockPodcastDTOs: PodcastListDTO[] = [
  {
    id: "123",
    title: "Test Podcast 1",
    author: "Test Author 1",
    image: "medium.jpg",
    description: "Description 1",
  },
  {
    id: "456",
    title: "Test Podcast 2",
    author: "Test Author 2",
    image: "test2.jpg",
    description: "Description 2",
  },
];

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

describe("HomePage with Context API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();

    // Reset context mock to default state
    mockPodcastContextValue = {
      podcasts: mockPodcastDTOs,
      loading: false,
      error: null,
    };

    // Mock filterPodcasts implementation
    mockPodcastService.filterPodcasts.mockImplementation(
      (podcasts: PodcastListDTO[], search: string) => {
        if (!search) return podcasts;
        return podcasts.filter(
          (p: PodcastListDTO) =>
            p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.author.toLowerCase().includes(search.toLowerCase()),
        );
      },
    );
  });

  it("renders podcasts and handles navigation", async () => {
    renderWithRouter(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("TEST PODCAST 1")).toBeInTheDocument();
      expect(screen.getByText("TEST PODCAST 2")).toBeInTheDocument();
    });

    // Click on first podcast card
    const firstPodcastCard = screen.getByText("TEST PODCAST 1").closest("div");
    fireEvent.click(firstPodcastCard!);

    expect(mockNavigate).toHaveBeenCalledWith("/podcast/123");
  });

  it("navigates to correct podcast detail page", async () => {
    renderWithRouter(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("TEST PODCAST 2")).toBeInTheDocument();
    });

    const secondPodcastCard = screen.getByText("TEST PODCAST 2").closest("div");
    fireEvent.click(secondPodcastCard!);

    expect(mockNavigate).toHaveBeenCalledWith("/podcast/456");
  });

  it("shows results count correctly", async () => {
    renderWithRouter(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  it("search functionality filters podcasts", async () => {
    renderWithRouter(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("TEST PODCAST 1")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Filter podcasts...");
    fireEvent.change(searchInput, { target: { value: "Test Podcast 1" } });

    await waitFor(() => {
      expect(mockPodcastService.filterPodcasts).toHaveBeenCalledWith(
        mockPodcastDTOs,
        "Test Podcast 1",
      );
    });

    expect(searchInput).not.toBeDisabled();
  });

  it("search shows no results message when no matches", async () => {
    // Set up filter to return empty array
    mockPodcastService.filterPodcasts.mockReturnValue([]);

    renderWithRouter(<HomePage />);

    const searchInput = screen.getByPlaceholderText("Filter podcasts...");
    fireEvent.change(searchInput, { target: { value: "NonExistent" } });

    await waitFor(() => {
      expect(
        screen.getByText('No podcasts found for "NonExistent"'),
      ).toBeInTheDocument();
      expect(screen.getByText("Show all podcasts")).toBeInTheDocument();
    });

    // Test clear search button
    const clearButton = screen.getByText("Show all podcasts");
    fireEvent.click(clearButton);

    expect(searchInput).toHaveValue("");
  });

  it("handles loading state from context", () => {
    mockPodcastContextValue = {
      podcasts: [],
      loading: true,
      error: null,
    };

    renderWithRouter(<HomePage />);

    expect(screen.getByText("Loading podcasts...")).toBeInTheDocument();
  });

  it("handles error state from context", () => {
    mockPodcastContextValue = {
      podcasts: [],
      loading: false,
      error: "Network error",
    };

    renderWithRouter(<HomePage />);

    expect(
      screen.getByText("Error loading podcasts: Network error"),
    ).toBeInTheDocument();
  });

  it("shows empty state when no podcasts available", () => {
    mockPodcastContextValue = {
      podcasts: [],
      loading: false,
      error: null,
    };

    renderWithRouter(<HomePage />);

    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.queryByText("TEST PODCAST 1")).not.toBeInTheDocument();
  });

  it("filters podcasts by author as well as title", async () => {
    renderWithRouter(<HomePage />);

    const searchInput = screen.getByPlaceholderText("Filter podcasts...");
    fireEvent.change(searchInput, { target: { value: "Author 1" } });

    await waitFor(() => {
      expect(mockPodcastService.filterPodcasts).toHaveBeenCalledWith(
        mockPodcastDTOs,
        "Author 1",
      );
    });
  });
});
