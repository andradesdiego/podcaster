// src/hooks/usePodcastDDD.ts
import { useState, useEffect } from "react";
import { Container } from "../infrastructure/di/Container";
import { PodcastEntry } from "../types/podcast";

// Exactamente la misma interface que usePodcast del Context
export const usePodcastDDD = () => {
  const [podcasts, setPodcasts] = useState<PodcastEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const container = Container.getInstance();
  const podcastService = container.getPodcastService();

  useEffect(() => {
    const loadPodcasts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Usamos el servicio DDD y convertimos a PodcastEntry[]
        const dddPodcasts = await podcastService.getTopPodcasts();

        // Convertir DTOs a PodcastEntry (formato que espera la UI)
        const podcastEntries: PodcastEntry[] = dddPodcasts.map((podcast) => ({
          id: {
            attributes: {
              "im:id": podcast.id,
            },
          },
          "im:name": {
            label: podcast.title,
          },
          "im:artist": {
            label: podcast.author,
          },
          "im:image": [
            {
              label: podcast.image || "",
              attributes: {
                height: "170",
              },
            },
          ],
        }));

        setPodcasts(podcastEntries);
      } catch (err) {
        console.error("Error loading podcasts:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    loadPodcasts();
  }, []);

  return { podcasts, loading, error };
};
