import { useState, useEffect } from "react";
import { Container } from "../infrastructure/di/Container";
import { PodcastEntry } from "../types/podcast";
import { PodcastListDTO } from "../application/dto/PodcastDTO";

export const usePodcastService = () => {
  const [podcasts, setPodcasts] = useState<PodcastEntry[]>([]);
  const [podcastDTOs, setPodcastDTOs] = useState<PodcastListDTO[]>([]); // ← Guardar DTOs también
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const container = Container.getInstance();
  const podcastService = container.getPodcastService();

  useEffect(() => {
    const loadPodcasts = async () => {
      try {
        setLoading(true);
        setError(null);

        const dddPodcasts = await podcastService.getTopPodcasts();
        setPodcastDTOs(dddPodcasts);

        // Convertir DTOs a PodcastEntry (formato que espera la UI)
        const podcastEntries: PodcastEntry[] = dddPodcasts.map((dto) => ({
          id: {
            attributes: {
              "im:id": dto.id,
            },
          },
          "im:name": {
            label: dto.title,
          },
          "im:artist": {
            label: dto.author,
          },
          "im:image": [
            {
              label: dto.image || "",
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
  }, [podcastService]);

  const filterPodcasts = (searchTerm: string): PodcastEntry[] => {
    if (!searchTerm.trim()) return podcasts;

    // Usar el servicio para filtrar DTOs
    const filteredDTOs = podcastService.filterPodcasts(podcastDTOs, searchTerm);

    // Convertir DTOs filtrados a PodcastEntry
    return filteredDTOs.map((dto) => ({
      id: {
        attributes: {
          "im:id": dto.id,
        },
      },
      "im:name": {
        label: dto.title,
      },
      "im:artist": {
        label: dto.author,
      },
      "im:image": [
        {
          label: dto.image || "",
          attributes: {
            height: "170",
          },
        },
      ],
    }));
  };

  return { podcasts, loading, error, filterPodcasts };
};
