import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { EmptyState } from './EmptyState';
import { Calendar } from 'lucide-react';

describe('EmptyState Component', () => {
  it('renders title and description properly', () => {
    render(
      <MemoryRouter>
        <EmptyState
          icon={Calendar}
          title="No Events Scheduled"
          description="There are currently no upcoming events on the campus calendar."
        />
      </MemoryRouter>
    );

    expect(screen.getByText('No Events Scheduled')).toBeInTheDocument();
    expect(
      screen.getByText(
        'There are currently no upcoming events on the campus calendar.'
      )
    ).toBeInTheDocument();
  });

  it('renders clear filters button when onClearFilters is provided', async () => {
    const handleClear = vi.fn();
    render(
      <MemoryRouter>
        <EmptyState
          title="No Results Found"
          description="No societies matched your query."
          onClearFilters={handleClear}
          clearFiltersLabel="Clear All Filters"
        />
      </MemoryRouter>
    );

    const clearButton = screen.getByRole('button', { name: /clear all filters/i });
    expect(clearButton).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(clearButton);
    expect(handleClear).toHaveBeenCalledTimes(1);
  });

  it('renders primary CTA button and handles clicks', async () => {
    const handleClick = vi.fn();
    render(
      <MemoryRouter>
        <EmptyState
          title="Empty Queue"
          description="All caught up"
          action={{
            label: 'Submit Proposal',
            onClick: handleClick,
          }}
        />
      </MemoryRouter>
    );

    const actionButton = screen.getByRole('button', { name: /submit proposal/i });
    expect(actionButton).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(actionButton);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
