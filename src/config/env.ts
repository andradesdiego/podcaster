// src/config/env.ts
const getEnvVar = (key: string, defaultValue: string = ""): string => {
  return import.meta.env[key] ?? defaultValue;
};

const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = import.meta.env[key];
  return value ? Number(value) : defaultValue;
};

// Configuración centralizada
export const config = {
  // API URLs
  itunesRssUrl: getEnvVar(
    "VITE_ITUNES_RSS_URL",
    import.meta.env.DEV ? "/rss" : "/us/rss"
  ),
  itunesLookupUrl: getEnvVar("VITE_ITUNES_LOOKUP_URL", "/lookup"),

  // API Limits
  podcastLimit: getEnvNumber("VITE_PODCAST_LIMIT", 100),
  episodeLimit: getEnvNumber("VITE_EPISODE_LIMIT", 20),

  // Cache TTL
  cacheTTLHours: getEnvNumber("VITE_CACHE_TTL_HOURS", 24),
};
