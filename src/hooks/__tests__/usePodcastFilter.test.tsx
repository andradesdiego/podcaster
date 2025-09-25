import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { usePodcastFilter } from "../usePodcastFilter";
import { PodcastEntry } from "../../types/podcast";

const createMockPodcast = (
  id: string,
  title: string,
  author: string
): PodcastEntry => ({
  id: { attributes: { "im:id": id } },
  "im:name": { label: title },
  "im:artist": { label: author },
  "im:image": [],
});

describe("usePodcastFilter", () => {
  const mockPodcasts = [
    createMockPodcast("1", "JavaScript Weekly", "Tech Corp"),
    createMockPodcast("2", "React Deep Dive", "Frontend Masters"),
    createMockPodcast("3", "Python for Beginners", "Code Academy"),
  ];

  it("returns all podcasts when search term is empty", () => {
    const { result } = renderHook(() => usePodcastFilter(mockPodcasts));

    expect(result.current.filteredPodcasts).toHaveLength(3);
    expect(result.current.resultsCount).toBe(3);
    expect(result.current.searchTerm).toBe("");
  });

  it("filters podcasts by title", () => {
    const { result } = renderHook(() => usePodcastFilter(mockPodcasts));

    act(() => {
      result.current.setSearchTerm("JavaScript");
    });

    expect(result.current.filteredPodcasts).toHaveLength(1);
    expect(result.current.filteredPodcasts[0]["im:name"].label).toBe(
      "JavaScript Weekly"
    );
    expect(result.current.resultsCount).toBe(1);
  });

  it("filters podcasts by author", () => {
    const { result } = renderHook(() => usePodcastFilter(mockPodcasts));

    act(() => {
      result.current.setSearchTerm("Tech Corp");
    });

    expect(result.current.filteredPodcasts).toHaveLength(1);
    expect(result.current.filteredPodcasts[0]["im:artist"].label).toBe(
      "Tech Corp"
    );
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

  it("returns empty array when no matches found", () => {
    const { result } = renderHook(() => usePodcastFilter(mockPodcasts));

    act(() => {
      result.current.setSearchTerm("NonExistent");
    });

    expect(result.current.filteredPodcasts).toHaveLength(0);
    expect(result.current.resultsCount).toBe(0);
  });

  it("handles empty podcasts array", () => {
    const { result } = renderHook(() => usePodcastFilter([]));

    expect(result.current.filteredPodcasts).toHaveLength(0);
    expect(result.current.resultsCount).toBe(0);
  });
});
