/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { Container } from "../infrastructure/di/Container";
import {
  PodcastListDTO,
  PodcastDetailDTO,
  EpisodeDTO,
} from "../application/dto/PodcastDTO";

interface PodcastState {
  podcasts: PodcastListDTO[];
  loading: boolean;
  error: string | null;
  // Episodes state using DTOs
  episodeDetails: { [podcastId: string]: PodcastDetailDTO };
  episodesLoading: { [podcastId: string]: boolean };
  episodesError: { [podcastId: string]: string | null };
}

type PodcastAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: PodcastListDTO[] }
  | { type: "FETCH_ERROR"; payload: string }
  | { type: "CLEAR_ERROR" }
  | { type: "FETCH_EPISODES_START"; payload: { podcastId: string } }
  | {
      type: "FETCH_EPISODES_SUCCESS";
      payload: { podcastId: string; detail: PodcastDetailDTO };
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
  getEpisodes: (podcastId: string) => EpisodeDTO[];
}

const initialState: PodcastState = {
  podcasts: [],
  loading: false,
  error: null,
  episodeDetails: {},
  episodesLoading: {},
  episodesError: {},
};

function podcastReducer(
  state: PodcastState,
  action: PodcastAction,
): PodcastState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return {
        ...state,
        loading: false,
        podcasts: action.payload,
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
        episodeDetails: {
          ...state.episodeDetails,
          [action.payload.podcastId]: action.payload.detail,
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

// Local context - no export
const PodcastContext = createContext<PodcastContextType | undefined>(undefined);

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
    dispatch({ type: "FETCH_EPISODES_START", payload: { podcastId } });

    try {
      const container = Container.getInstance();
      const podcastService = container.getPodcastService();
      const detail = await podcastService.getPodcastDetails(podcastId);

      dispatch({
        type: "FETCH_EPISODES_SUCCESS",
        payload: { podcastId, detail },
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

  const getEpisodes = useCallback(
    (podcastId: string): EpisodeDTO[] => {
      return state.episodeDetails[podcastId]?.episodes || [];
    },
    [state.episodeDetails],
  );

  useEffect(() => {
    fetchPodcasts();
  }, [fetchPodcasts]);

  const contextValue: PodcastContextType = {
    ...state,
    fetchPodcasts,
    clearError,
    fetchEpisodes,
    clearEpisodesError,
    getEpisodes,
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
