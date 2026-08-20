import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { NotFoundPage } from './NotFoundPage';

describe('NotFoundPage Integration', () => {
  it('renders the 404 page correctly', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );

    expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument();
    expect(
      screen.getByText('The requested page does not exist or has been moved.')
    ).toBeInTheDocument();
  });

  it('contains a link to return to the home page', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );

    const homeLink = screen.getByRole('link', { name: /go back/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });
});
