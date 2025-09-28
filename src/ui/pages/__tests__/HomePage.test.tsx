import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';
import { HomePage } from '../HomePage';
import { PodcastProvider } from '../../context/PodcastContext';

// Mock components
vi.mock('../../components/PodcastCard', () => ({
  PodcastCard: ({ title, onClick }: { title: string; onClick: () => void }) => (
    <div onClick={onClick}>{title}</div>
  ),
}));

vi.mock('../../components/SearchInput', () => ({
  SearchInput: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (val: string) => void;
  }) => (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Filter podcasts..."
    />
  ),
}));

// Mock DI
const { mockGetTopPodcasts } = vi.hoisted(() => ({
  mockGetTopPodcasts: { execute: vi.fn() },
}));

vi.mock('../../../app/di', () => ({
  getTopPodcasts: mockGetTopPodcasts,
}));

describe('HomePage', () => {
  it('renders podcasts and search works', async () => {
    mockGetTopPodcasts.execute.mockResolvedValue([
      {
        id: '1',
        title: 'Tech Podcast',
        author: 'Tech Author',
        image: 'tech.jpg',
      },
      {
        id: '2',
        title: 'Music Show',
        author: 'Music Author',
        image: 'music.jpg',
      },
    ]);

    render(
      <MemoryRouter>
        <PodcastProvider>
          <HomePage />
        </PodcastProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('TECH PODCAST')).toBeInTheDocument();
      expect(screen.getByText('MUSIC SHOW')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument(); // results count
    });

    // Test search
    const searchInput = screen.getByPlaceholderText('Filter podcasts...');
    fireEvent.change(searchInput, { target: { value: 'tech' } });

    expect(screen.getByText('TECH PODCAST')).toBeInTheDocument();
    expect(screen.queryByText('MUSIC SHOW')).not.toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // filtered count
  });
});
