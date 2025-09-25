import { useState, useMemo } from "react";
import { PodcastEntry } from "../types/podcast";

export interface UsePodcastFilterResult {
  filteredPodcasts: PodcastEntry[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  resultsCount: number;
}

export function usePodcastFilter(
  podcasts: PodcastEntry[]
): UsePodcastFilterResult {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPodcasts = useMemo(() => {
    if (!searchTerm.trim()) {
      return podcasts;
    }

    const term = searchTerm.toLowerCase().trim();

    return podcasts.filter((podcast) => {
      const title = podcast?.["im:name"]?.label?.toLowerCase() || "";
      const author = podcast?.["im:artist"]?.label?.toLowerCase() || "";

      return title.includes(term) || author.includes(term);
    });
  }, [podcasts, searchTerm]);

  return {
    filteredPodcasts,
    searchTerm,
    setSearchTerm,
    resultsCount: filteredPodcasts.length,
  };
}
