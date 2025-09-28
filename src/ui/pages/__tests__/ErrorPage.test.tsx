import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { ErrorPage } from '../ErrorPage';

describe('ErrorPage', () => {
  it('renders error message', () => {
    render(
      <MemoryRouter>
        <ErrorPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
    expect(screen.getByText('Go Home')).toBeInTheDocument();
  });
});
