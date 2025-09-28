import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ItunesPodcastRepository } from '../ItunesPodcastRepository';
import { PodcastId } from '../../../domain/value-objects/PodcastId';
import { HttpClient } from '../../http/HttpClient';
import { ItunesTopPodcastsResponse, ItunesLookupResponse } from '../../mappers/ItunesMappers';
import { config } from '../../../config/env';

// Mock the config
vi.mock('../../../config/env', () => ({
  config: {
    topPodcastsUrl: 'https://itunes.apple.com/us/rss/toppodcasts/limit=100/genre=1310/json',
    lookupUrl: 'https://itunes.apple.com/lookup',
  },
}));

// Mock the HttpClient with proper typing
const mockHttpClient = {
  get: vi.fn(),
} as HttpClient;

describe('ItunesPodcastRepository', () => {
  let repository: ItunesPodcastRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new ItunesPodcastRepository(mockHttpClient);
  });

  describe('getTopPodcasts', () => {
    it('should fetch and return top podcasts', async () => {
      const mockResponse: ItunesTopPodcastsResponse = {
        feed: {
          entry: [
            {
              id: { attributes: { 'im:id': '123' } },
              'im:name': { label: 'Test Podcast 1' },
              'im:artist': { label: 'Test Author 1' },
              'im:image': [{ label: 'https://example.com/image1.jpg' }],
              summary: { label: 'Test description 1' },
            },
            {
              id: { attributes: { 'im:id': '456' } },
              'im:name': { label: 'Test Podcast 2' },
              'im:artist': { label: 'Test Author 2' },
              'im:image': [
                { label: 'https://example.com/image2-small.jpg' },
                { label: 'https://example.com/image2-large.jpg' },
              ],
              // No summary to test optional field
            },
          ],
        },
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await repository.getTopPodcasts();

      expect(mockHttpClient.get).toHaveBeenCalledWith(config.topPodcastsUrl);
      expect(result).toHaveLength(2);

      // Check first podcast
      expect(result[0].getId().getValue()).toBe('123');
      expect(result[0].getTitle()).toBe('Test Podcast 1');
      expect(result[0].getAuthor()).toBe('Test Author 1');
      expect(result[0].getDescription()).toBe('Test description 1');
      expect(result[0].getBestImageUrl()).toBe('https://example.com/image1.jpg');

      // Check second podcast (no summary)
      expect(result[1].getId().getValue()).toBe('456');
      expect(result[1].getTitle()).toBe('Test Podcast 2');
      expect(result[1].getAuthor()).toBe('Test Author 2');
      expect(result[1].getDescription()).toBe('');
      expect(result[1].getBestImageUrl()).toBe('https://example.com/image2-large.jpg');
    });

    it('should handle empty response', async () => {
      const mockResponse: ItunesTopPodcastsResponse = {
        feed: {
          entry: [],
        },
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await repository.getTopPodcasts();

      expect(result).toHaveLength(0);
    });

    it('should handle HTTP errors', async () => {
      const error = new Error('Network error');
      vi.mocked(mockHttpClient.get).mockRejectedValue(error);

      await expect(repository.getTopPodcasts()).rejects.toThrow('Network error');
    });
  });

  describe('getPodcastById', () => {
    it('should fetch and return podcast by ID', async () => {
      const podcastId = PodcastId.create('123');
      const mockResponse: ItunesLookupResponse = {
        results: [
          {
            collectionId: 123,
            collectionName: 'Test Podcast',
            artistName: 'Test Author',
            artworkUrl600: 'https://example.com/artwork.jpg',
            description: 'Test podcast description',
          },
          {
            kind: 'podcast-episode',
            trackId: 1001,
            trackName: 'Episode 1',
            description: 'Episode 1 description',
            episodeUrl: 'https://example.com/episode1.mp3',
            trackTimeMillis: 1800000, // 30 minutes
            releaseDate: '2024-01-01T00:00:00Z',
          },
        ],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await repository.getPodcastById(podcastId);

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `${config.lookupUrl}?id=123&media=podcast&entity=podcastEpisode&limit=20`
      );
      expect(result).not.toBeNull();
      expect(result!.getId().getValue()).toBe('123');
      expect(result!.getTitle()).toBe('Test Podcast');
      expect(result!.getAuthor()).toBe('Test Author');
      expect(result!.getDescription()).toBe('Test podcast description');
      expect(result!.getBestImageUrl()).toBe('https://example.com/artwork.jpg');
    });

    it('should return null when podcast not found', async () => {
      const podcastId = PodcastId.create('999');
      const mockResponse: ItunesLookupResponse = {
        results: [],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await repository.getPodcastById(podcastId);

      expect(result).toBeNull();
    });

    it('should handle response with only episodes (no podcast info)', async () => {
      const podcastId = PodcastId.create('123');
      const mockResponse: ItunesLookupResponse = {
        results: [
          {
            kind: 'podcast-episode',
            trackId: 1001,
            trackName: 'Episode 1',
            description: 'Episode 1 description',
          },
        ],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await repository.getPodcastById(podcastId);

      expect(result).toBeNull();
    });
  });

  describe('getEpisodesByPodcastId', () => {
    it('should fetch and return episodes for a podcast', async () => {
      const podcastId = PodcastId.create('123');
      const mockResponse: ItunesLookupResponse = {
        results: [
          {
            collectionId: 123,
            collectionName: 'Test Podcast',
            artistName: 'Test Author',
          },
          {
            kind: 'podcast-episode',
            trackId: 1001,
            trackName: 'Episode 1',
            description: 'Episode 1 description',
            episodeUrl: 'https://example.com/episode1.mp3',
            trackTimeMillis: 1800000, // 30 minutes
            releaseDate: '2024-01-01T00:00:00Z',
          },
          {
            kind: 'podcast-episode',
            trackId: 1002,
            trackName: 'Episode 2',
            description: 'Episode 2 description',
            episodeUrl: 'https://example.com/episode2.mp3',
            trackTimeMillis: 2400000, // 40 minutes
            releaseDate: '2024-01-02T00:00:00Z',
          },
        ],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await repository.getEpisodesByPodcastId(podcastId);

      expect(result).toHaveLength(2);

      // Check first episode
      expect(result[0].getId()).toBe('1001');
      expect(result[0].getTitle()).toBe('Episode 1');
      expect(result[0].getDescription()).toBe('Episode 1 description');
      expect(result[0].getAudioUrl()).toBe('https://example.com/episode1.mp3');
      expect(result[0].getDuration()).toBe(1800);
      expect(result[0].getFormattedDate()).toBe('01/01/2024');
      expect(result[0].getPodcastId().getValue()).toBe('123');

      // Check second episode
      expect(result[1].getId()).toBe('1002');
      expect(result[1].getTitle()).toBe('Episode 2');
      expect(result[1].getDescription()).toBe('Episode 2 description');
      expect(result[1].getAudioUrl()).toBe('https://example.com/episode2.mp3');
      expect(result[1].getDuration()).toBe(2400);
      expect(result[1].getFormattedDate()).toBe('02/01/2024');
    });

    it('should handle episodes with missing optional fields', async () => {
      const podcastId = PodcastId.create('123');
      const mockResponse: ItunesLookupResponse = {
        results: [
          {
            collectionId: 123,
            collectionName: 'Test Podcast',
          },
          {
            kind: 'podcast-episode',
            trackId: 1001,
            trackName: 'Episode with minimal data',
            // Missing: description, episodeUrl, trackTimeMillis, releaseDate
          },
        ],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await repository.getEpisodesByPodcastId(podcastId);

      expect(result).toHaveLength(1);
      expect(result[0].getId()).toBe('1001');
      expect(result[0].getTitle()).toBe('Episode with minimal data');
      expect(result[0].getDescription()).toBe('');
      expect(result[0].getAudioUrl()).toBe(null);
      expect(result[0].getDuration()).toBe(null);
    });

    it('should return empty array when no episodes found', async () => {
      const podcastId = PodcastId.create('123');
      const mockResponse: ItunesLookupResponse = {
        results: [
          {
            collectionId: 123,
            collectionName: 'Test Podcast',
            // No episodes
          },
        ],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await repository.getEpisodesByPodcastId(podcastId);

      expect(result).toHaveLength(0);
    });
  });

  describe('getEpisodeById', () => {
    it('should find and return specific episode', async () => {
      const podcastId = PodcastId.create('123');
      const mockResponse: ItunesLookupResponse = {
        results: [
          {
            collectionId: 123,
            collectionName: 'Test Podcast',
          },
          {
            kind: 'podcast-episode',
            trackId: 1001,
            trackName: 'Episode 1',
            description: 'Episode 1 description',
          },
          {
            kind: 'podcast-episode',
            trackId: 1002,
            trackName: 'Episode 2',
            description: 'Episode 2 description',
          },
        ],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await repository.getEpisodeById('1002', podcastId);

      expect(result).not.toBeNull();
      expect(result!.getId()).toBe('1002');
      expect(result!.getTitle()).toBe('Episode 2');
      expect(result!.getDescription()).toBe('Episode 2 description');
    });

    it('should return null when episode not found', async () => {
      const podcastId = PodcastId.create('123');
      const mockResponse: ItunesLookupResponse = {
        results: [
          {
            collectionId: 123,
            collectionName: 'Test Podcast',
          },
          {
            kind: 'podcast-episode',
            trackId: 1001,
            trackName: 'Episode 1',
          },
        ],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await repository.getEpisodeById('999', podcastId);

      expect(result).toBeNull();
    });

    it('should return null when no episodes exist', async () => {
      const podcastId = PodcastId.create('123');
      const mockResponse: ItunesLookupResponse = {
        results: [
          {
            collectionId: 123,
            collectionName: 'Test Podcast',
          },
        ],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await repository.getEpisodeById('1001', podcastId);

      expect(result).toBeNull();
    });
  });

  describe('fetchPodcastWithEpisodes (integration)', () => {
    it('should make correct API call with proper URL format', async () => {
      const podcastId = PodcastId.create('123');
      const mockResponse: ItunesLookupResponse = {
        results: [],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      await repository.getPodcastById(podcastId);

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `${config.lookupUrl}?id=123&media=podcast&entity=podcastEpisode&limit=20`
      );
    });

    it('should handle network errors gracefully', async () => {
      const podcastId = PodcastId.create('123');
      const networkError = new Error('Failed to fetch');

      vi.mocked(mockHttpClient.get).mockRejectedValue(networkError);

      await expect(repository.getPodcastById(podcastId)).rejects.toThrow('Failed to fetch');
      await expect(repository.getEpisodesByPodcastId(podcastId)).rejects.toThrow('Failed to fetch');
    });
  });
});