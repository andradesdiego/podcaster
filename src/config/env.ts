// src/config/env.ts
const getEnvVar = (key: string, defaultValue: string = ""): string => {
  return import.meta.env[key] ?? defaultValue;
};

const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = import.meta.env[key];
  return value ? Number(value) : defaultValue;
};

// Debug: verificar valores
const BASE_URL = getEnvVar("VITE_API_BASE_URL");
const RSS_PATH = getEnvVar("VITE_ITUNES_RSS_URL", "/us/rss");
const LOOKUP_PATH = getEnvVar("VITE_ITUNES_LOOKUP_URL", "/lookup");

console.log("ENV DEBUG:", { BASE_URL, RSS_PATH, LOOKUP_PATH });

export const config = {
  topPodcastsUrl: BASE_URL
    ? `${BASE_URL}${RSS_PATH}/toppodcasts/limit=100/genre=1310/json`
    : `${RSS_PATH}/toppodcasts/limit=100/genre=1310/json`,

  lookupUrl: BASE_URL ? `${BASE_URL}${LOOKUP_PATH}` : LOOKUP_PATH,

  episodeLimit: getEnvNumber("VITE_EPISODE_LIMIT", 20),
  cacheTTLHours: getEnvNumber("VITE_CACHE_TTL_HOURS", 24),
};

console.log("CONFIG RESULT:", config);
