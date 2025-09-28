import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { PodcastDetail } from '../PodcastDetail';
import { usePodcast } from '../../context/PodcastContext';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '123' }),
  };
});

vi.mock('../../components/PodcastSidebar', () => ({
  PodcastSidebar: ({ podcast }: { podcast?: { title?: string } }) => (
    <div data-testid="sidebar">{podcast?.title || 'Sidebar'}</div>
  ),
}));

vi.mock('../../context/PodcastContext', () => ({
  usePodcast: vi.fn(),
}));

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

describe('PodcastDetail', () => {
  beforeEach(() => {
    vi.mocked(usePodcast).mockReturnValue({
      podcasts: [
        {
          id: '123',
          title: 'Test Podcast',
          author: 'Test Author',
          image: 'test.jpg',
          description: 'Test Description',
        },
      ],
      loading: false,
      error: null,
      episodes: {
        '123': [
          {
            id: 'ep1',
            title: 'Episode 1',
            description: 'Episode Description',
            publishedAt: '01/01/2024',
            duration: '30 min',
            podcastId: '123',
          },
        ],
      },
      loadPodcasts: vi.fn().mockResolvedValue(undefined),
      loadEpisodes: vi.fn().mockResolvedValue(undefined),
    });
  });

  it('renders podcast with episodes', () => {
    renderWithRouter(<PodcastDetail />);

    expect(screen.getByText('Test Podcast')).toBeInTheDocument();
    expect(screen.getByText('Episodes (1)')).toBeInTheDocument();
    expect(screen.getByText('Episode 1')).toBeInTheDocument();
  });

  it("shows not found when podcast doesn't exist", () => {
    vi.mocked(usePodcast).mockReturnValue({
      podcasts: [],
      loading: false,
      error: null,
      episodes: {},
      loadPodcasts: vi.fn().mockResolvedValue(undefined),
      loadEpisodes: vi.fn().mockResolvedValue(undefined),
    });

    renderWithRouter(<PodcastDetail />);

    expect(screen.getByText('Podcast not found')).toBeInTheDocument();
  });
});
