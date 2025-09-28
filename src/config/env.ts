const getEnvVar = (key: string, defaultValue: string = ''): string => {
  return import.meta.env[key] ?? defaultValue;
};

const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = import.meta.env[key];
  return value ? Number(value) : defaultValue;
};

const getEnvBoolean = (key: string, defaultValue: boolean): boolean => {
  const value = import.meta.env[key];
  return value ? value === 'true' : defaultValue;
};

const BASE_URL = getEnvVar('VITE_API_BASE_URL');
const RSS_PATH = getEnvVar('VITE_ITUNES_RSS_URL', '/us/rss');
const USE_PROXY = getEnvBoolean('VITE_USE_CORS_PROXY', !import.meta.env.DEV);
const PODCAST_LIMIT = getEnvNumber('VITE_PODCAST_LIMIT', 100);

export const config = {
  topPodcastsUrl: BASE_URL
    ? `${BASE_URL}${RSS_PATH}/toppodcasts/limit=${PODCAST_LIMIT}/genre=1310/json`
    : `${RSS_PATH}/toppodcasts/limit=${PODCAST_LIMIT}/genre=1310/json`,

  lookupUrl: import.meta.env.DEV ? '/lookup' : '/api/episodes',

  cacheTTLHours: getEnvNumber('VITE_CACHE_TTL_HOURS', 24), // ✅ number
  useCorsProxy: USE_PROXY,
};
