import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '123' }),
  };
});

// Mock components
vi.mock('../../components/PodcastSidebar', () => ({
  PodcastSidebar: ({ podcast }: { podcast?: { title?: string } }) => (
    <div data-testid="sidebar">{podcast?.title || 'Sidebar'}</div>
  ),
}));

// Mock Context with inline implementation - no external variables
vi.mock('../../context/PodcastContext', () => {
  const mockFn = vi.fn();
  return {
    usePodcast: mockFn.mockReturnValue({
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
      loadPodcasts: vi.fn(),
      loadEpisodes: vi.fn(),
    }),
  };
});

import { PodcastDetail } from '../PodcastDetail';

describe('PodcastDetail', () => {
  it('renders podcast with episodes', () => {
    render(
      <MemoryRouter initialEntries={['/podcast/123']}>
        <PodcastDetail />
      </MemoryRouter>
    );

    expect(screen.getByText('Test Podcast')).toBeInTheDocument();
    expect(screen.getByText('Episodes (1)')).toBeInTheDocument();
    expect(screen.getByText('Episode 1')).toBeInTheDocument();
  });
});
