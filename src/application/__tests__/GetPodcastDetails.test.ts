import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetPodcastDetails } from '../use-cases/GetPodcastDetails';
import { PodcastNotFoundError } from '../../domain/errors/DomainError';
import { PodcastRepository } from '../ports/PodcastRepository';
import { CacheRepository } from '../ports/CacheRepository';
import { config } from '../../config/env';

const mockRepository = {
  getTopPodcasts: vi.fn(),
  getPodcastById: vi.fn(),
  getEpisodesByPodcastId: vi.fn(),
  getEpisodeById: vi.fn(),
} as PodcastRepository;

const mockCache = {
  get: vi.fn(),
  set: vi.fn(),
  isExpired: vi.fn(),
  clear: vi.fn(),
} as CacheRepository;

describe('GetPodcastDetails', () => {
  let useCase: GetPodcastDetails;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new GetPodcastDetails(mockRepository, mockCache);

    vi.mocked(mockCache.get).mockReturnValue(null);
    vi.mocked(mockCache.isExpired).mockReturnValue(true);

    const mockPodcast = {
      getId: () => ({ getValue: () => '123' }),
      getTitle: () => 'Test Podcast',
      getAuthor: () => 'Test Author',
      getBestImageUrl: () => 'test.jpg',
      getDescription: () => 'Test description',
    };

    const mockEpisodes = [
      {
        getId: () => 'ep1',
        getTitle: () => 'Episode 1',
        getDescription: () => 'Episode description',
        getAudioUrl: () => 'audio.mp3',
        getMinutesForTable: () => '30 min',
        getFormattedDate: () => '01/01/2024',
        getPodcastId: () => ({ getValue: () => '123' }),
      },
    ];

    vi.mocked(mockRepository.getPodcastById).mockResolvedValue(mockPodcast as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    vi.mocked(mockRepository.getEpisodesByPodcastId).mockResolvedValue(
      mockEpisodes as any // eslint-disable-line @typescript-eslint/no-explicit-any
    );
  });

  it('returns podcast detail with episodes', async () => {
    const result = await useCase.execute('123');

    expect(result.id).toBe('123');
    expect(result.title).toBe('Test Podcast');
    expect(result.episodes).toHaveLength(1);
    expect(result.episodes[0].title).toBe('Episode 1');
    expect(result.episodeCount).toBe(1);
  });

  it('returns cached data when available', async () => {
    const cachedData = {
      id: '123',
      title: 'Cached Podcast',
      author: 'Cached Author',
      image: 'cached.jpg',
      description: 'Cached description',
      episodeCount: 1,
      episodes: [
        {
          id: 'ep1',
          title: 'Cached Episode',
          description: 'Cached desc',
          publishedAt: '01/01/2024',
          duration: '30 min',
          podcastId: '123',
        },
      ],
    };

    vi.mocked(mockCache.get).mockReturnValue(cachedData);
    vi.mocked(mockCache.isExpired).mockReturnValue(false);

    const result = await useCase.execute('123');

    expect(result).toEqual(cachedData);
    expect(mockRepository.getPodcastById).not.toHaveBeenCalled();
  });

  it('caches data after fetching', async () => {
    await useCase.execute('123');

    expect(mockCache.set).toHaveBeenCalledWith(
      'podcast_detail_123',
      expect.any(Object),
      config.cacheTTLHours
    );
  });

  it('throws PodcastNotFoundError when podcast is not found', async () => {
    vi.mocked(mockRepository.getPodcastById).mockResolvedValue(null);

    await expect(useCase.execute('999')).rejects.toThrow(
      PodcastNotFoundError
    );
    expect(mockCache.set).not.toHaveBeenCalled();
  });

  it('throws error for invalid podcast ID format', async () => {
    await expect(useCase.execute('invalid-id')).rejects.toThrow(
      'PodcastId must be numeric'
    );
  });

  it('clears expired cache before checking', async () => {
    vi.mocked(mockCache.isExpired).mockReturnValue(true);
    vi.mocked(mockCache.get).mockReturnValue({ id: '123', title: 'Expired Data' });

    await useCase.execute('123');

    expect(mockCache.clear).toHaveBeenCalledWith('podcast_detail_123');
    expect(mockRepository.getPodcastById).toHaveBeenCalled();
  });

  it('maps episodes correctly including optional fields', async () => {
    const mockEpisodeWithNulls = {
      getId: () => 'ep2',
      getTitle: () => 'Episode 2',
      getDescription: () => 'Description 2',
      getAudioUrl: () => null,
      getMinutesForTable: () => null,
      getFormattedDate: () => '02/01/2024',
      getPodcastId: () => ({ getValue: () => '123' }),
    };

    vi.mocked(mockRepository.getEpisodesByPodcastId).mockResolvedValue([
      mockEpisodeWithNulls as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    ]);

    const result = await useCase.execute('123');

    expect(result.episodes[0]).toEqual({
      id: 'ep2',
      title: 'Episode 2',
      description: 'Description 2',
      audioUrl: undefined,
      duration: undefined,
      publishedAt: '02/01/2024',
      podcastId: '123',
    });
  });
});
