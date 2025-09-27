const getEnvVar = (key: string, defaultValue: string = ""): string => {
  return import.meta.env[key] ?? defaultValue;
};

const getEnvBoolean = (key: string, defaultValue: boolean): boolean => {
  const value = import.meta.env[key];
  return value ? value === "true" : defaultValue;
};

const BASE_URL = getEnvVar("VITE_API_BASE_URL");
const RSS_PATH = getEnvVar("VITE_ITUNES_RSS_URL", "/us/rss");
const USE_PROXY = getEnvBoolean("VITE_USE_CORS_PROXY", !import.meta.env.DEV);
const EPISODES_LIMIT = getEnvVar("VITE_PODCAST_LIMIT");

export const config = {
  topPodcastsUrl: BASE_URL
    ? `${BASE_URL}${RSS_PATH}/toppodcasts/limit=100/genre=1310/json`
    : `${RSS_PATH}/toppodcasts/limit=${EPISODES_LIMIT}/genre=1310/json`,

  lookupUrl: import.meta.env.DEV
    ? "/lookup" // Proxy de Vite en desarrollo
    : "/api/episodes", // Tu API en producción

  episodeLimit: getEnvVar("VITE_EPISODE_LIMIT"),
  cacheTTLHours: getEnvVar("VITE_CACHE_TTL_HOURS"),
  useCorsProxy: USE_PROXY,
};
