import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';
import { PodcastDetail } from '../PodcastDetail';
import { PodcastProvider } from '../../context/PodcastContext';

// Mock components
vi.mock('../../components/PodcastSidebar', () => ({
  PodcastSidebar: () => <div>Sidebar</div>,
}));

// Mock DI
const { mockGetTopPodcasts, mockGetPodcastDetails } = vi.hoisted(() => ({
  mockGetTopPodcasts: { execute: vi.fn() },
  mockGetPodcastDetails: { execute: vi.fn() },
}));

vi.mock('../../../app/di', () => ({
  getTopPodcasts: mockGetTopPodcasts,
  getPodcastDetails: mockGetPodcastDetails,
}));

describe('PodcastDetail', () => {
  it('renders podcast with episodes', async () => {
    mockGetTopPodcasts.execute.mockResolvedValue([
      { id: '123', title: 'Test Podcast', author: 'Author', image: 'img.jpg' },
    ]);

    mockGetPodcastDetails.execute.mockResolvedValue({
      episodes: [
        {
          id: 'ep1',
          title: 'Episode 1',
          publishedAt: '2024-01-01',
          duration: 1800000,
        },
      ],
    });

    render(
      <MemoryRouter initialEntries={['/podcast/123']}>
        <PodcastProvider>
          <PodcastDetail />
        </PodcastProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Episodes (1)')).toBeInTheDocument();
      expect(screen.getByText('Episode 1')).toBeInTheDocument();
    });
  });
});
