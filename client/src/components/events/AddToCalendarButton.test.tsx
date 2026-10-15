import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AddToCalendarButton } from './AddToCalendarButton';

const mockEvent = {
  id: 'evt-test-1',
  title: 'AI & Robotics Summit 2026',
  description: 'Annual summit covering advanced robotics and AI innovations.',
  eventDate: '2026-10-15T10:00:00.000Z',
  startTime: '10:00',
  endTime: '16:00',
  venue: 'AHA Auditorium',
  society: { name: 'ACM GIKI Student Chapter' },
};

describe('AddToCalendarButton Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders correctly with default button text and icon', () => {
    render(<AddToCalendarButton event={mockEvent} />);
    const button = screen.getByRole('button', { name: /Add to Calendar/i });
    expect(button).toBeDefined();
    expect(screen.getByText('Add to Calendar')).toBeDefined();
  });

  it('renders in compact variant as an icon button', () => {
    render(<AddToCalendarButton event={mockEvent} variant="compact" />);
    const button = screen.getByTitle('Add to your personal calendar');
    expect(button).toBeDefined();
    expect(screen.queryByText('Add to Calendar')).toBeNull();
  });

  it('opens portal dropdown menu on click and lists calendar options', () => {
    render(<AddToCalendarButton event={mockEvent} direction="up" />);
    const button = screen.getByRole('button', { name: /Add to Calendar/i });

    // Initially dropdown is not in DOM
    expect(screen.queryByText('Add Event To')).toBeNull();

    // Click button to toggle open
    fireEvent.click(button);

    // Dropdown is rendered into document.body
    expect(screen.getByText('Add Event To')).toBeDefined();
    expect(screen.getByText('Google Calendar')).toBeDefined();
    expect(screen.getByText('Apple Calendar (iCal)')).toBeDefined();
    expect(screen.getByText('Outlook.com')).toBeDefined();
    expect(screen.getByText('Microsoft 365')).toBeDefined();
    expect(screen.getByText('Yahoo Calendar')).toBeDefined();
    expect(screen.getByText('Download .ics File')).toBeDefined();
  });

  it('opens Google calendar link when Google Calendar option is clicked', () => {
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<AddToCalendarButton event={mockEvent} />);

    const button = screen.getByRole('button', { name: /Add to Calendar/i });
    fireEvent.click(button);

    const googleBtn = screen.getByText('Google Calendar');
    fireEvent.click(googleBtn);

    expect(windowOpenSpy).toHaveBeenCalledTimes(1);
    expect(windowOpenSpy.mock.calls[0][0]).toContain('calendar.google.com');

    // Menu should close after clicking
    expect(screen.queryByText('Add Event To')).toBeNull();
  });

  it('closes dropdown when escape key is pressed', () => {
    render(<AddToCalendarButton event={mockEvent} />);
    const button = screen.getByRole('button', { name: /Add to Calendar/i });

    fireEvent.click(button);
    expect(screen.getByText('Add Event To')).toBeDefined();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByText('Add Event To')).toBeNull();
  });
});
