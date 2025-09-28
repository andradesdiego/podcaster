import { render, screen, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { PodcastProvider, usePodcast } from '../PodcastContext';
import { getTopPodcasts, getPodcastDetails } from '../../../app/di';

// Mock the DI module
vi.mock('../../../app/di', () => ({
  getTopPodcasts: {
    execute: vi.fn(),
  },
  getPodcastDetails: {
    execute: vi.fn(),
  },
}));

// Test component that uses the context
function TestComponent() {
  const { podcasts, loading, error, episodes, loadPodcasts, loadEpisodes } = usePodcast();

  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <div data-testid="podcasts-count">{podcasts.length}</div>
      <div data-testid="episodes-count">{Object.keys(episodes).length}</div>
      <button onClick={loadPodcasts} data-testid="load-podcasts">
        Load Podcasts
      </button>
      <button onClick={() => loadEpisodes('123')} data-testid="load-episodes">
        Load Episodes
      </button>
      {podcasts.map((podcast) => (
        <div key={podcast.id} data-testid={`podcast-${podcast.id}`}>
          {podcast.title}
        </div>
      ))}
    </div>
  );
}

describe('PodcastContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws error when usePodcast is used outside provider', () => {
    expect(() => {
      render(<TestComponent />);
    }).toThrow('usePodcast must be used within PodcastProvider');
  });

  it('provides initial state correctly', async () => {
    vi.mocked(getTopPodcasts.execute).mockResolvedValue([]);

    render(
      <PodcastProvider>
        <TestComponent />
      </PodcastProvider>
    );

    // Initially should be loading
    expect(screen.getByTestId('loading')).toHaveTextContent('loading');
    expect(screen.getByTestId('podcasts-count')).toHaveTextContent('0');
    expect(screen.getByTestId('episodes-count')).toHaveTextContent('0');
    expect(screen.getByTestId('error')).toHaveTextContent('no-error');

    // Wait for auto-load to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });
  });

  it('loads podcasts successfully on mount', async () => {
    const mockPodcasts = [
      {
        id: '1',
        title: 'Test Podcast 1',
        author: 'Author 1',
        image: 'image1.jpg',
        description: 'Description 1',
      },
      {
        id: '2',
        title: 'Test Podcast 2',
        author: 'Author 2',
        image: 'image2.jpg',
        description: 'Description 2',
      },
    ];

    vi.mocked(getTopPodcasts.execute).mockResolvedValue(mockPodcasts);

    render(
      <PodcastProvider>
        <TestComponent />
      </PodcastProvider>
    );

    // Wait for podcasts to load
    await waitFor(() => {
      expect(screen.getByTestId('podcasts-count')).toHaveTextContent('2');
    });

    expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    expect(screen.getByTestId('error')).toHaveTextContent('no-error');
    expect(screen.getByTestId('podcast-1')).toHaveTextContent('Test Podcast 1');
    expect(screen.getByTestId('podcast-2')).toHaveTextContent('Test Podcast 2');
    expect(getTopPodcasts.execute).toHaveBeenCalledOnce();
  });

  it('handles error when loading podcasts fails', async () => {
    const errorMessage = 'Failed to load podcasts';
    vi.mocked(getTopPodcasts.execute).mockRejectedValue(new Error(errorMessage));

    render(
      <PodcastProvider>
        <TestComponent />
      </PodcastProvider>
    );

    // Wait for error to be set
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent(errorMessage);
    });

    expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    expect(screen.getByTestId('podcasts-count')).toHaveTextContent('0');
  });

  it('handles non-Error when loading podcasts fails', async () => {
    vi.mocked(getTopPodcasts.execute).mockRejectedValue('String error');

    render(
      <PodcastProvider>
        <TestComponent />
      </PodcastProvider>
    );

    // Wait for error to be set
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Error');
    });

    expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
  });

  it('loads podcasts manually when loadPodcasts is called', async () => {
    const mockPodcasts = [
      {
        id: '1',
        title: 'Manual Podcast',
        author: 'Manual Author',
        image: 'manual.jpg',
        description: 'Manual Description',
      },
    ];

    // First call (auto-load) returns empty, second call (manual) returns data
    vi.mocked(getTopPodcasts.execute)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(mockPodcasts);

    render(
      <PodcastProvider>
        <TestComponent />
      </PodcastProvider>
    );

    // Wait for initial load to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    expect(screen.getByTestId('podcasts-count')).toHaveTextContent('0');

    // Manually trigger load
    act(() => {
      screen.getByTestId('load-podcasts').click();
    });

    // Should be loading
    expect(screen.getByTestId('loading')).toHaveTextContent('loading');

    // Wait for manual load to complete
    await waitFor(() => {
      expect(screen.getByTestId('podcasts-count')).toHaveTextContent('1');
    });

    expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    expect(screen.getByTestId('podcast-1')).toHaveTextContent('Manual Podcast');
    expect(getTopPodcasts.execute).toHaveBeenCalledTimes(2);
  });

  it('loads episodes successfully', async () => {
    const mockPodcastDetail = {
      id: '123',
      title: 'Test Podcast',
      author: 'Test Author',
      image: 'test.jpg',
      description: 'Test Description',
      episodeCount: 2,
      episodes: [
        {
          id: 'ep1',
          title: 'Episode 1',
          description: 'Episode 1 description',
          audioUrl: 'audio1.mp3',
          duration: '30:00',
          publishedAt: '2024-01-01',
          podcastId: '123',
        },
        {
          id: 'ep2',
          title: 'Episode 2',
          description: 'Episode 2 description',
          audioUrl: 'audio2.mp3',
          duration: '25:00',
          publishedAt: '2024-01-02',
          podcastId: '123',
        },
      ],
    };

    vi.mocked(getTopPodcasts.execute).mockResolvedValue([]);
    vi.mocked(getPodcastDetails.execute).mockResolvedValue(mockPodcastDetail);

    render(
      <PodcastProvider>
        <TestComponent />
      </PodcastProvider>
    );

    // Wait for initial load to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    expect(screen.getByTestId('episodes-count')).toHaveTextContent('0');

    // Load episodes
    act(() => {
      screen.getByTestId('load-episodes').click();
    });

    // Wait for episodes to load
    await waitFor(() => {
      expect(screen.getByTestId('episodes-count')).toHaveTextContent('1');
    });

    expect(getPodcastDetails.execute).toHaveBeenCalledWith('123');
  });

  it('handles error when loading episodes fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.mocked(getTopPodcasts.execute).mockResolvedValue([]);
    vi.mocked(getPodcastDetails.execute).mockRejectedValue(new Error('Episodes error'));

    render(
      <PodcastProvider>
        <TestComponent />
      </PodcastProvider>
    );

    // Wait for initial load to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    // Load episodes
    act(() => {
      screen.getByTestId('load-episodes').click();
    });

    // Wait a bit to ensure the error is handled
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error loading episodes:', expect.any(Error));
    });

    expect(screen.getByTestId('episodes-count')).toHaveTextContent('0');

    consoleSpy.mockRestore();
  });

  it('accumulates episodes from multiple podcasts', async () => {
    const mockPodcastDetail1 = {
      id: '123',
      title: 'Test Podcast 1',
      author: 'Author 1',
      image: 'image1.jpg',
      description: 'Description 1',
      episodeCount: 1,
      episodes: [{ id: 'ep1', title: 'Episode 1', description: 'Desc', publishedAt: '2024-01-01', podcastId: '123' }],
    };

    const mockPodcastDetail2 = {
      id: '456',
      title: 'Test Podcast 2',
      author: 'Author 2',
      image: 'image2.jpg',
      description: 'Description 2',
      episodeCount: 1,
      episodes: [{ id: 'ep2', title: 'Episode 2', description: 'Desc', publishedAt: '2024-01-02', podcastId: '456' }],
    };

    vi.mocked(getTopPodcasts.execute).mockResolvedValue([]);
    vi.mocked(getPodcastDetails.execute)
      .mockResolvedValueOnce(mockPodcastDetail1)
      .mockResolvedValueOnce(mockPodcastDetail2);

    const TestMultipleEpisodes = () => {
      const { episodes, loadEpisodes } = usePodcast();
      return (
        <div>
          <div data-testid="episodes-count">{Object.keys(episodes).length}</div>
          <button onClick={() => loadEpisodes('123')} data-testid="load-episodes-123">
            Load Episodes 123
          </button>
          <button onClick={() => loadEpisodes('456')} data-testid="load-episodes-456">
            Load Episodes 456
          </button>
        </div>
      );
    };

    render(
      <PodcastProvider>
        <TestMultipleEpisodes />
      </PodcastProvider>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('episodes-count')).toHaveTextContent('0');
    });

    // Load episodes for first podcast
    act(() => {
      screen.getByTestId('load-episodes-123').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('episodes-count')).toHaveTextContent('1');
    });

    // Load episodes for second podcast
    act(() => {
      screen.getByTestId('load-episodes-456').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('episodes-count')).toHaveTextContent('2');
    });

    expect(getPodcastDetails.execute).toHaveBeenCalledWith('123');
    expect(getPodcastDetails.execute).toHaveBeenCalledWith('456');
  });
});