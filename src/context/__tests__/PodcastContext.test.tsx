import { render, screen, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PodcastProvider, usePodcast } from "../PodcastContext";
import { Container } from "../../infrastructure/di/Container";

// Eliminado: Tests específicos de cache, localStorage, HTTP (son responsabilidad del servicio DDD)
// Simplificado: Solo tests de la lógica del Context: loading, error, dispatch
// Mockeo: Container en lugar de fetch/localStorage
// DTOs: Test data limpia en lugar de estructura iTunes

// Mock the Container
vi.mock("../../infrastructure/di/Container", () => ({
  Container: {
    getInstance: vi.fn(),
  },
}));

const mockPodcastService = {
  getTopPodcasts: vi.fn(),
  getPodcastDetails: vi.fn(),
  filterPodcasts: vi.fn(),
};

// Test DTOs instead of iTunes structure
const mockPodcastDTOs = [
  {
    id: "123",
    title: "Test Podcast",
    author: "Test Author",
    image: "test.jpg",
    description: "Test description",
  },
];

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

describe("PodcastContext", () => {
  const mockContainer = {
    getPodcastService: () => mockPodcastService,
  } as unknown as Container;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(Container.getInstance).mockReturnValue(mockContainer);
    mockPodcastService.getTopPodcasts.mockResolvedValue(mockPodcastDTOs);
  });

  it("throws error when used outside provider", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => render(<TestComponent />)).toThrow(
      "usePodcast must be used within a PodcastProvider",
    );

    consoleError.mockRestore();
  });

  it("fetches podcasts on mount", async () => {
    renderWithProvider(<TestComponent />);

    expect(screen.getByTestId("loading")).toHaveTextContent("loading");

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("not-loading");
    });

    expect(screen.getByTestId("count")).toHaveTextContent("1");
    expect(screen.getByTestId("error")).toHaveTextContent("no-error");
    expect(mockPodcastService.getTopPodcasts).toHaveBeenCalledOnce();
  });

  it("handles fetch errors", async () => {
    mockPodcastService.getTopPodcasts.mockRejectedValueOnce(
      new Error("Network error"),
    );

    renderWithProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent("Network error");
    });

    expect(screen.getByTestId("loading")).toHaveTextContent("not-loading");
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("clears errors", async () => {
    mockPodcastService.getTopPodcasts.mockRejectedValueOnce(
      new Error("Test error"),
    );

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
    const secondMockData = [
      ...mockPodcastDTOs,
      {
        id: "456",
        title: "Second Podcast",
        author: "Second Author",
        image: "second.jpg",
        description: "Second description",
      },
    ];

    mockPodcastService.getTopPodcasts
      .mockResolvedValueOnce(mockPodcastDTOs)
      .mockResolvedValueOnce(secondMockData);

    renderWithProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId("count")).toHaveTextContent("1");
    });

    act(() => {
      screen.getByText("Refetch").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("count")).toHaveTextContent("2");
    });

    expect(mockPodcastService.getTopPodcasts).toHaveBeenCalledTimes(2);
  });
});
