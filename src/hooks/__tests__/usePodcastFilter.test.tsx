import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { usePodcastFilter } from "../usePodcastFilter";
import { PodcastEntry } from "../../types/podcast";

const mockPodcasts: PodcastEntry[] = [
  {
    id: { attributes: { "im:id": "1" } },
    "im:name": { label: "JavaScript Weekly" },
    "im:artist": { label: "Tech Corp" },
    "im:image": [],
  },
  {
    id: { attributes: { "im:id": "2" } },
    "im:name": { label: "React Deep Dive" },
    "im:artist": { label: "Frontend Masters" },
    "im:image": [],
  },
  {
    id: { attributes: { "im:id": "3" } },
    "im:name": { label: "Python for Beginners" },
    "im:artist": { label: "Code Academy" },
    "im:image": [],
  },
  {
    id: { attributes: { "im:id": "4" } },
    "im:name": { label: "Advanced JavaScript" },
    "im:artist": { label: "Tech Corp" },
    "im:image": [],
  },
];

describe("usePodcastFilter", () => {
  it("returns all podcasts when search term is empty", () => {
    const { result } = renderHook(() => usePodcastFilter(mockPodcasts));

    expect(result.current.filteredPodcasts).toHaveLength(4);
    expect(result.current.filteredPodcasts).toEqual(mockPodcasts);
    expect(result.current.resultsCount).toBe(4);
    expect(result.current.searchTerm).toBe("");
  });

  it("filters podcasts by title", () => {
    const { result } = renderHook(() => usePodcastFilter(mockPodcasts));

    act(() => {
      result.current.setSearchTerm("JavaScript");
    });

    expect(result.current.filteredPodcasts).toHaveLength(2);
    expect(result.current.filteredPodcasts[0]["im:name"].label).toBe(
      "JavaScript Weekly"
    );
    expect(result.current.filteredPodcasts[1]["im:name"].label).toBe(
      "Advanced JavaScript"
    );
    expect(result.current.resultsCount).toBe(2);
    expect(result.current.searchTerm).toBe("JavaScript");
  });

  it("filters podcasts by author", () => {
    const { result } = renderHook(() => usePodcastFilter(mockPodcasts));

    act(() => {
      result.current.setSearchTerm("Tech Corp");
    });

    expect(result.current.filteredPodcasts).toHaveLength(2);
    expect(result.current.filteredPodcasts[0]["im:artist"].label).toBe(
      "Tech Corp"
    );
    expect(result.current.filteredPodcasts[1]["im:artist"].label).toBe(
      "Tech Corp"
    );
    expect(result.current.resultsCount).toBe(2);
  });

  it("is case insensitive", () => {
    const { result } = renderHook(() => usePodcastFilter(mockPodcasts));

    act(() => {
      result.current.setSearchTerm("REACT");
    });

    expect(result.current.filteredPodcasts).toHaveLength(1);
    expect(result.current.filteredPodcasts[0]["im:name"].label).toBe(
      "React Deep Dive"
    );
  });

  it("handles partial matches", () => {
    const { result } = renderHook(() => usePodcastFilter(mockPodcasts));

    act(() => {
      result.current.setSearchTerm("Java");
    });

    expect(result.current.filteredPodcasts).toHaveLength(2);
    expect(result.current.resultsCount).toBe(2);
  });

  it("returns empty array when no matches found", () => {
    const { result } = renderHook(() => usePodcastFilter(mockPodcasts));

    act(() => {
      result.current.setSearchTerm("NonExistent");
    });

    expect(result.current.filteredPodcasts).toHaveLength(0);
    expect(result.current.resultsCount).toBe(0);
  });

  it("trims whitespace from search term", () => {
    const { result } = renderHook(() => usePodcastFilter(mockPodcasts));

    act(() => {
      result.current.setSearchTerm("  React  ");
    });

    expect(result.current.filteredPodcasts).toHaveLength(1);
    expect(result.current.searchTerm).toBe("  React  "); // Original term preserved
  });

  it("handles empty podcasts array", () => {
    const { result } = renderHook(() => usePodcastFilter([]));

    expect(result.current.filteredPodcasts).toHaveLength(0);
    expect(result.current.resultsCount).toBe(0);

    act(() => {
      result.current.setSearchTerm("anything");
    });

    expect(result.current.filteredPodcasts).toHaveLength(0);
    expect(result.current.resultsCount).toBe(0);
  });

  it("handles malformed podcast data gracefully", () => {
    const malformedPodcasts = [
      {
        id: { attributes: { "im:id": "1" } },
        "im:name": { label: "Valid Podcast" },
        "im:artist": { label: "Valid Author" },
        "im:image": [],
      },
      // Missing required fields
      {} as PodcastEntry,
    ];

    const { result } = renderHook(() => usePodcastFilter(malformedPodcasts));

    act(() => {
      result.current.setSearchTerm("Valid");
    });

    expect(result.current.filteredPodcasts).toHaveLength(1);
    expect(result.current.filteredPodcasts[0]["im:name"].label).toBe(
      "Valid Podcast"
    );
  });

  it("updates results when podcasts prop changes", () => {
    const { result, rerender } = renderHook(
      ({ podcasts }) => usePodcastFilter(podcasts),
      { initialProps: { podcasts: mockPodcasts } }
    );

    act(() => {
      result.current.setSearchTerm("JavaScript");
    });

    expect(result.current.resultsCount).toBe(2);

    // Update podcasts prop
    const newPodcasts = mockPodcasts.slice(0, 1); // Only first podcast
    rerender({ podcasts: newPodcasts });

    expect(result.current.resultsCount).toBe(1);
  });
});
