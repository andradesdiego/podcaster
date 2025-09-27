const getEnvVar = (key: string, defaultValue: string = ""): string => {
  return import.meta.env[key] ?? defaultValue;
};

const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = import.meta.env[key];
  return value ? Number(value) : defaultValue;
};

export const config = {
  get topPodcastsUrl() {
    const base = getEnvVar("VITE_API_BASE_URL");
    const rssPath = getEnvVar(
      "VITE_ITUNES_RSS_URL",
      import.meta.env.DEV ? "/rss" : "/us/rss"
    );

    if (base) {
      return `${base}${rssPath}/toppodcasts/limit=100/genre=1310/json`;
    }
    return `${rssPath}/toppodcasts/limit=100/genre=1310/json`;
  },

  get lookupUrl() {
    const base = getEnvVar("VITE_API_BASE_URL");
    const lookupPath = getEnvVar("VITE_ITUNES_LOOKUP_URL", "/lookup");

    if (base) {
      return `${base}${lookupPath}`;
    }
    return lookupPath;
  },

  podcastLimit: getEnvNumber("VITE_PODCAST_LIMIT", 100),
  episodeLimit: getEnvNumber("VITE_EPISODE_LIMIT", 20),
  cacheTTLHours: getEnvNumber("VITE_CACHE_TTL_HOURS", 24),
};
