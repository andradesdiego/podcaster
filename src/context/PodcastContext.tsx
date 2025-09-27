/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { Episode, PodcastLookupResponse } from "../types/podcast";

import { Container } from "../infrastructure/di/Container";
import { PodcastListDTO } from "../application/dto/PodcastDTO";

const EPISODES_CACHE_KEY = "episodes-cache";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface EpisodeCacheData {
  data: PodcastLookupResponse;
  timestamp: number;
}

interface EpisodesCache {
  [podcastId: string]: EpisodeCacheData;
}

interface PodcastState {
  podcasts: PodcastListDTO[]; // Changed from PodcastEntry[]
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
  // Episodes state (keep as is for now)
  episodes: { [podcastId: string]: Episode[] };
  episodesLoading: { [podcastId: string]: boolean };
  episodesError: { [podcastId: string]: string | null };
}

type PodcastAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: PodcastListDTO[] } // Changed from PodcastEntry[]
  | { type: "FETCH_ERROR"; payload: string }
  | { type: "CLEAR_ERROR" }
  | { type: "FETCH_EPISODES_START"; payload: { podcastId: string } }
  | {
      type: "FETCH_EPISODES_SUCCESS";
      payload: { podcastId: string; episodes: Episode[] };
    }
  | {
      type: "FETCH_EPISODES_ERROR";
      payload: { podcastId: string; error: string };
    }
  | { type: "CLEAR_EPISODES_ERROR"; payload: { podcastId: string } };

interface PodcastContextType extends PodcastState {
  fetchPodcasts: () => Promise<void>;
  clearError: () => void;
  fetchEpisodes: (podcastId: string) => Promise<void>;
  clearEpisodesError: (podcastId: string) => void;
}

const initialState: PodcastState = {
  podcasts: [], // Now PodcastListDTO[]
  loading: false,
  error: null,
  lastFetch: null,
  episodes: {},
  episodesLoading: {},
  episodesError: {},
};

function podcastReducer(
  state: PodcastState,
  action: PodcastAction
): PodcastState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return {
        ...state,
        loading: false,
        podcasts: action.payload,
        lastFetch: Date.now(),
        error: null,
      };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };
    case "CLEAR_ERROR":
      return { ...state, error: null };

    case "FETCH_EPISODES_START":
      return {
        ...state,
        episodesLoading: {
          ...state.episodesLoading,
          [action.payload.podcastId]: true,
        },
        episodesError: {
          ...state.episodesError,
          [action.payload.podcastId]: null,
        },
      };
    case "FETCH_EPISODES_SUCCESS":
      return {
        ...state,
        episodes: {
          ...state.episodes,
          [action.payload.podcastId]: action.payload.episodes,
        },
        episodesLoading: {
          ...state.episodesLoading,
          [action.payload.podcastId]: false,
        },
        episodesError: {
          ...state.episodesError,
          [action.payload.podcastId]: null,
        },
      };
    case "FETCH_EPISODES_ERROR":
      return {
        ...state,
        episodesLoading: {
          ...state.episodesLoading,
          [action.payload.podcastId]: false,
        },
        episodesError: {
          ...state.episodesError,
          [action.payload.podcastId]: action.payload.error,
        },
      };
    case "CLEAR_EPISODES_ERROR":
      return {
        ...state,
        episodesError: {
          ...state.episodesError,
          [action.payload.podcastId]: null,
        },
      };
    default:
      return state;
  }
}

const PodcastContext = createContext<PodcastContextType | undefined>(undefined);

const isValidEpisodeCache = (cacheData: EpisodeCacheData | null): boolean => {
  if (!cacheData) return false;
  const now = Date.now();
  return now - cacheData.timestamp < CACHE_DURATION;
};

const getEpisodesFromCache = (podcastId: string): EpisodeCacheData | null => {
  try {
    const cached = localStorage.getItem(EPISODES_CACHE_KEY);
    if (!cached) return null;

    const episodesCache: EpisodesCache = JSON.parse(cached);
    return episodesCache[podcastId] || null;
  } catch {
    return null;
  }
};

const saveEpisodesToCache = (
  podcastId: string,
  episodes: PodcastLookupResponse
): void => {
  try {
    const cached = localStorage.getItem(EPISODES_CACHE_KEY);
    const episodesCache: EpisodesCache = cached ? JSON.parse(cached) : {};

    episodesCache[podcastId] = {
      data: episodes,
      timestamp: Date.now(),
    };

    localStorage.setItem(EPISODES_CACHE_KEY, JSON.stringify(episodesCache));
  } catch {
    // Silently fail if localStorage is not available
  }
};

const extractEpisodes = (apiResponse: PodcastLookupResponse): Episode[] => {
  const results = apiResponse?.results ?? [];
  // El primer resultado es el podcast (PodcastDetail), el resto son episodios (Episode)
  return results.slice(1).filter((item): item is Episode => "trackId" in item);
};

interface PodcastProviderProps {
  children: ReactNode;
}

export function PodcastProvider({ children }: PodcastProviderProps) {
  const [state, dispatch] = useReducer(podcastReducer, initialState);

  const fetchPodcasts = useCallback(async () => {
    const container = Container.getInstance();
    const podcastService = container.getPodcastService();

    dispatch({ type: "FETCH_START" });

    try {
      const podcasts = await podcastService.getTopPodcasts();
      dispatch({ type: "FETCH_SUCCESS", payload: podcasts });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      dispatch({ type: "FETCH_ERROR", payload: errorMessage });
    }
  }, []);
  const fetchEpisodes = useCallback(async (podcastId: string) => {
    const cachedEpisodes = getEpisodesFromCache(podcastId);

    if (isValidEpisodeCache(cachedEpisodes)) {
      const episodes = extractEpisodes(cachedEpisodes!.data);
      dispatch({
        type: "FETCH_EPISODES_SUCCESS",
        payload: { podcastId, episodes },
      });
      return;
    }

    dispatch({ type: "FETCH_EPISODES_START", payload: { podcastId } });

    try {
      // Usar proxy de Vite en lugar de allorigins.win
      const url = `/lookup?id=${podcastId}&media=podcast&entity=podcastEpisode&limit=20`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const apiResponse = (await response.json()) as PodcastLookupResponse;
      const episodes = extractEpisodes(apiResponse);

      saveEpisodesToCache(podcastId, apiResponse);
      dispatch({
        type: "FETCH_EPISODES_SUCCESS",
        payload: { podcastId, episodes },
      });
    } catch (error) {
      dispatch({
        type: "FETCH_EPISODES_ERROR",
        payload: {
          podcastId,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  const clearEpisodesError = useCallback((podcastId: string) => {
    dispatch({ type: "CLEAR_EPISODES_ERROR", payload: { podcastId } });
  }, []);

  useEffect(() => {
    fetchPodcasts();
  }, [fetchPodcasts]);

  const contextValue: PodcastContextType = {
    ...state,
    fetchPodcasts,
    clearError,
    fetchEpisodes,
    clearEpisodesError,
  };

  return (
    <PodcastContext.Provider value={contextValue}>
      {children}
    </PodcastContext.Provider>
  );
}

export function usePodcast(): PodcastContextType {
  const context = useContext(PodcastContext);
  if (context === undefined) {
    throw new Error("usePodcast must be used within a PodcastProvider");
  }
  return context;
}
