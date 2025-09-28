import { GetTopPodcasts } from '../application/use-cases/GetTopPodcasts';
import { GetPodcastDetails } from '../application/use-cases/GetPodcastDetails';
import { ItunesPodcastRepository } from '../infrastructure/repositories/ItunesPodcastRepository';
import { LocalStorageCacheRepository } from '../infrastructure/cache/LocalStorageCacheRepository';
import { FetchHttpClient } from '../infrastructure/http/HttpClient';

// Shared dependencies
const httpClient = new FetchHttpClient();
const repository = new ItunesPodcastRepository(httpClient);
const cache = new LocalStorageCacheRepository();

// Export use case instances directly
export const getTopPodcasts = new GetTopPodcasts(repository, cache);
export const getPodcastDetails = new GetPodcastDetails(repository, cache);
