// src/hooks/usePodcastService.ts
import { useState } from "react";
import { Container } from "../infrastructure/di/Container";
import {
  PodcastListDTO,
  PodcastDetailDTO,
} from "../application/dto/PodcastDTO";

export const usePodcastService = () => {
  const [podcasts, setPodcasts] = useState<PodcastListDTO[]>([]);
  const [podcastDetails, setPodcastDetails] = useState<
    Map<string, PodcastDetailDTO>
  >(new Map());
  const [loading, setLoading] = useState(false);

  const container = Container.getInstance();
  const podcastService = container.getPodcastService();

  const loadTopPodcasts = async (): Promise<void> => {
    try {
      setLoading(true);
      const result = await podcastService.getTopPodcasts();
      setPodcasts(result);
    } catch (err) {
      console.error("Error loading top podcasts:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadPodcastDetails = async (id: string): Promise<void> => {
    if (podcastDetails.has(id)) return;

    try {
      setLoading(true);
      const result = await podcastService.getPodcastDetails(id);
      setPodcastDetails((prev) => new Map(prev).set(id, result));
    } catch (err) {
      console.error("Error loading podcast details:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterPodcasts = (searchTerm: string): PodcastListDTO[] => {
    if (!searchTerm.trim()) return podcasts;
    return podcastService.filterPodcasts(podcasts, searchTerm);
  };

  return {
    podcasts,
    podcastDetails,
    loading,
    loadTopPodcasts,
    loadPodcastDetails,
    filterPodcasts,
  };
};
