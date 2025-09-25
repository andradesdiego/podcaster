/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from "react";
import { ApiResponse, PodcastEntry } from "../types/podcast";

const CACHE_KEY = "podcast-cache";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const TOP_PODCASTS_URL = "/rss/toppodcasts/limit=100/genre=1310/json";

interface CacheData {
  data: ApiResponse;
  timestamp: number;
}

interface PodcastState {
  podcasts: PodcastEntry[];
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
}

type PodcastAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: PodcastEntry[] }
  | { type: "FETCH_ERROR"; payload: string }
  | { type: "CLEAR_ERROR" };

interface PodcastContextType extends PodcastState {
  fetchPodcasts: () => Promise<void>;
  clearError: () => void;
}

const initialState: PodcastState = {
  podcasts: [],
  loading: false,
  error: null,
  lastFetch: null,
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
    default:
      return state;
  }
}

const PodcastContext = createContext<PodcastContextType | undefined>(undefined);

const isValidCache = (cacheData: CacheData | null): boolean => {
  if (!cacheData) return false;
  const now = Date.now();
  return now - cacheData.timestamp < CACHE_DURATION;
};

const getFromCache = (): CacheData | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

const saveToCache = (data: ApiResponse): void => {
  try {
    const cacheData: CacheData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch {
    // Silently fail if localStorage is not available
  }
};

const extractPodcasts = (apiResponse: ApiResponse): PodcastEntry[] => {
  return apiResponse?.feed?.entry ?? [];
};

interface PodcastProviderProps {
  children: ReactNode;
}

export function PodcastProvider({ children }: PodcastProviderProps) {
  const [state, dispatch] = useReducer(podcastReducer, initialState);

  const fetchPodcasts = async () => {
    const cachedData = getFromCache();

    if (isValidCache(cachedData)) {
      const podcasts = extractPodcasts(cachedData!.data);
      dispatch({ type: "FETCH_SUCCESS", payload: podcasts });
      return;
    }

    dispatch({ type: "FETCH_START" });

    try {
      const response = await fetch(TOP_PODCASTS_URL);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as ApiResponse;
      const podcasts = extractPodcasts(data);

      saveToCache(data);
      dispatch({ type: "FETCH_SUCCESS", payload: podcasts });
    } catch (error) {
      dispatch({
        type: "FETCH_ERROR",
        payload: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const contextValue: PodcastContextType = {
    ...state,
    fetchPodcasts,
    clearError,
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
