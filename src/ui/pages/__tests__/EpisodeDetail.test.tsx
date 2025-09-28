import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';
import { EpisodeDetail } from '../EpisodeDetail';
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

describe('EpisodeDetail', () => {
  it('renders episode with audio player', async () => {
    mockGetTopPodcasts.execute.mockResolvedValue([
      { id: '123', title: 'Test Podcast', author: 'Author', image: 'img.jpg' },
    ]);

    mockGetPodcastDetails.execute.mockResolvedValue({
      episodes: [
        {
          id: 'ep1',
          title: 'Test Episode',
          description: 'Episode description',
          audioUrl: 'audio.mp3',
        },
      ],
    });

    render(
      <MemoryRouter initialEntries={['/podcast/123/episode/ep1']}>
        <PodcastProvider>
          <EpisodeDetail />
        </PodcastProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Episode')).toBeInTheDocument();
      expect(screen.getByRole('application')).toBeInTheDocument(); // audio element
    });
  });
});
