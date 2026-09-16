import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EventCard } from './EventCard';
import type { EventFeedItem } from '@/types/feed.types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ to, children, onClick, className }: any) => (
      <a
        href={to}
        className={className}
        onClick={(e) => {
          if (onClick) onClick(e);
        }}
      >
        {children}
      </a>
    ),
  };
});

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: null }),
}));

const queryClient = new QueryClient();

const mockEventItem: EventFeedItem = {
  id: 'evt-101',
  title: 'Annual Tech Symposium 2026',
  description: 'Join us for the premier tech symposium at GIKI.',
  coverImageUrl: 'https://example.com/poster.jpg',
  eventDate: '2026-10-15T10:00:00.000Z',
  createdAt: '2026-09-01T08:00:00.000Z',
  venue: 'Agha Hasan Abedi Auditorium',
  society: {
    id: 'soc-1',
    name: 'Netronix Society',
    logoUrl: 'https://example.com/logo.jpg',
    username: 'netronix',
  },
  type: 'event',
} as unknown as EventFeedItem;

const renderComponent = (props: { item: EventFeedItem; reviewUrl?: string }) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <EventCard {...props} />
    </QueryClientProvider>
  );
};

describe('EventCard Component (No Flip Animation)', () => {
  it('renders event details and does not include 3D flipper or back face', () => {
    const { container } = renderComponent({ item: mockEventItem });

    expect(screen.getByText('Annual Tech Symposium 2026')).toBeInTheDocument();
    expect(screen.getByText('Agha Hasan Abedi Auditorium')).toBeInTheDocument();
    expect(screen.getByText('Netronix Society')).toBeInTheDocument();
    expect(screen.getByText('View Details')).toBeInTheDocument();

    // Verify 3D card flip elements are completely absent
    expect(container.querySelector('.card-flipper')).toBeNull();
    expect(container.querySelector('.card-back')).toBeNull();
  });

  it('navigates directly to /events/:id when the card is clicked', () => {
    mockNavigate.mockClear();
    renderComponent({ item: mockEventItem });

    const card = screen.getByRole('article', { name: /Event: Annual Tech Symposium 2026/i });
    fireEvent.click(card);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/events/evt-101');
  });

  it('navigates to /events/:id when "View Details" button is clicked', () => {
    mockNavigate.mockClear();
    renderComponent({ item: mockEventItem });

    const viewDetailsButton = screen.getByRole('button', { name: /view details/i });
    fireEvent.click(viewDetailsButton);

    expect(mockNavigate).toHaveBeenCalledWith('/events/evt-101');
  });

  it('supports keyboard navigation (Enter key)', () => {
    mockNavigate.mockClear();
    renderComponent({ item: mockEventItem });

    const card = screen.getByRole('article', { name: /Event: Annual Tech Symposium 2026/i });
    fireEvent.keyDown(card, { key: 'Enter' });

    expect(mockNavigate).toHaveBeenCalledWith('/events/evt-101');
  });

  it('navigates to reviewUrl when reviewUrl prop is provided', () => {
    mockNavigate.mockClear();
    renderComponent({ item: mockEventItem, reviewUrl: '/admin/events/evt-101/review' });

    const card = screen.getByRole('article', { name: /Event: Annual Tech Symposium 2026/i });
    fireEvent.click(card);

    expect(mockNavigate).toHaveBeenCalledWith('/admin/events/evt-101/review');
    expect(screen.getByRole('link', { name: /review/i })).toHaveAttribute('href', '/admin/events/evt-101/review');
  });
});
