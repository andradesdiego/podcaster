/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getTopPodcasts, getPodcastDetails } from "../../app/di";
import { PodcastListDTO, EpisodeDTO } from "../../application/dto/PodcastDTO";

interface PodcastContextType {
  podcasts: PodcastListDTO[];
  loading: boolean;
  error: string | null;
  episodes: { [podcastId: string]: EpisodeDTO[] };
  loadPodcasts: () => Promise<void>;
  loadEpisodes: (podcastId: string) => Promise<void>;
}

const PodcastContext = createContext<PodcastContextType | undefined>(undefined);

export function PodcastProvider({ children }: { children: ReactNode }) {
  const [podcasts, setPodcasts] = useState<PodcastListDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [episodes, setEpisodes] = useState<{ [key: string]: EpisodeDTO[] }>({});

  const loadPodcasts = async () => {
    setLoading(true);
    try {
      const result = await getTopPodcasts.execute();
      setPodcasts(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  const loadEpisodes = async (podcastId: string) => {
    try {
      const detail = await getPodcastDetails.execute(podcastId);
      setEpisodes((prev) => ({ ...prev, [podcastId]: detail.episodes }));
    } catch (err) {
      console.error("Error loading episodes:", err);
    }
  };

  // Auto-load podcasts on mount
  useEffect(() => {
    loadPodcasts();
  }, []);

  return (
    <PodcastContext.Provider
      value={{
        podcasts,
        loading,
        error,
        episodes,
        loadPodcasts,
        loadEpisodes,
      }}
    >
      {children}
    </PodcastContext.Provider>
  );
}

export function usePodcast() {
  const context = useContext(PodcastContext);
  if (!context) {
    throw new Error("usePodcast must be used within PodcastProvider");
  }
  return context;
}
