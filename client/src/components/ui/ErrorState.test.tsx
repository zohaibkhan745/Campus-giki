import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ErrorState } from './ErrorState';

describe('ErrorState Component', () => {
  it('renders offline/unreachable badge and title on network error', () => {
    const networkError = {
      isAxiosError: true,
      code: 'ERR_NETWORK',
      message: 'Network Error',
    };

    render(
      <MemoryRouter>
        <ErrorState error={networkError} />
      </MemoryRouter>
    );

    expect(screen.getByText('Campus Server Offline')).toBeInTheDocument();
    expect(screen.getByText('Unable to Reach Campus Hub')).toBeInTheDocument();
  });

  it('handles retry click and triggers onRetry callback', async () => {
    const handleRetry = vi.fn();
    render(
      <MemoryRouter>
        <ErrorState
          error={new Error('Test error')}
          onRetry={handleRetry}
          actionText="Try Reconnecting"
        />
      </MemoryRouter>
    );

    const retryButton = screen.getByRole('button', { name: /try reconnecting/i });
    expect(retryButton).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(retryButton);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('renders secondary action link when provided', () => {
    render(
      <MemoryRouter>
        <ErrorState
          title="Custom Error"
          secondaryAction={{
            label: 'Browse Directory',
            to: '/societies',
          }}
        />
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: /browse directory/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/societies');
  });
});
