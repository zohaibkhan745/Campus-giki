/**
 * Calendar Utilities for Campus GIKI
 * Provides RFC 5545 iCalendar (.ics) generation, client-side downloading,
 * and deep-link generators for Google Calendar, Outlook, Office 365, and Yahoo.
 */

export interface CalendarEventData {
  id?: string;
  title: string;
  description?: string;
  eventDate: string | Date;
  startTime?: string; // HH:mm format, e.g. "14:00"
  endTime?: string;   // HH:mm format, e.g. "16:30"
  venue?: string;
  societyName?: string;
  url?: string;
}

/**
 * Parses eventDate and time strings into proper Date instances.
 */
export function getEventDateTimes(event: CalendarEventData): { startDate: Date; endDate: Date } {
  let year: number;
  let month: number;
  let day: number;

  if (typeof event.eventDate === 'string') {
    const dateStr = event.eventDate.split('T')[0];
    const parts = dateStr.split('-').map(Number);
    year = parts[0];
    month = parts[1] - 1;
    day = parts[2];
  } else {
    year = event.eventDate.getFullYear();
    month = event.eventDate.getMonth();
    day = event.eventDate.getDate();
  }

  let startHours = 9;
  let startMinutes = 0;
  if (event.startTime) {
    const [h, m] = event.startTime.split(':').map(Number);
    if (!isNaN(h)) startHours = h;
    if (!isNaN(m)) startMinutes = m;
  }

  let endHours = startHours + 2;
  let endMinutes = startMinutes;
  if (event.endTime) {
    const [h, m] = event.endTime.split(':').map(Number);
    if (!isNaN(h)) endHours = h;
    if (!isNaN(m)) endMinutes = m;
  }

  const startDate = new Date(year, month, day, startHours, startMinutes, 0);
  let endDate = new Date(year, month, day, endHours, endMinutes, 0);

  // Fallback: If end time is before start time, set duration to 2 hours
  if (endDate <= startDate) {
    endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
  }

  return { startDate, endDate };
}

/**
 * Formats a Date object to UTC compact format for calendar URLs and iCalendar (YYYYMMDDTHHmmssZ).
 */
export function formatUtcForCalendar(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z'
  );
}

/**
 * Escapes special characters for RFC 5545 iCalendar fields.
 */
function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/**
 * Generates RFC 5545 compliant iCalendar (.ics) file content.
 */
export function generateIcsContent(event: CalendarEventData): string {
  const { startDate, endDate } = getEventDateTimes(event);
  const now = new Date();

  const uid = event.id ? `${event.id}@campusgiki.edu.pk` : `event-${Date.now()}@campusgiki.edu.pk`;
  const dtstamp = formatUtcForCalendar(now);
  const dtstart = formatUtcForCalendar(startDate);
  const dtend = formatUtcForCalendar(endDate);

  const summary = escapeIcsText(event.title);
  const description = escapeIcsText(event.description || '');
  const location = escapeIcsText(event.venue || 'GIK Institute, Topi');
  const organizer = event.societyName ? escapeIcsText(event.societyName) : 'Campus GIKI';

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Campus GIKI//Campus Hub Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    `ORGANIZER;CN=${organizer}:MAILTO:events@giki.edu.pk`,
    'STATUS:CONFIRMED',
  ];

  if (event.url) {
    lines.push(`URL:${event.url}`);
  }

  lines.push('END:VEVENT', 'END:VCALENDAR');

  return lines.join('\r\n');
}

/**
 * Triggers a client-side download of an .ics file (compatible with Apple Calendar, Outlook, etc.).
 */
export function downloadIcsFile(event: CalendarEventData, customFilename?: string): void {
  const icsContent = generateIcsContent(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const cleanTitle = event.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const filename = customFilename || `${cleanTitle || 'campus-event'}.ics`;

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates a direct Google Calendar creation link.
 */
export function createGoogleCalendarUrl(event: CalendarEventData): string {
  const { startDate, endDate } = getEventDateTimes(event);
  const dates = `${formatUtcForCalendar(startDate)}/${formatUtcForCalendar(endDate)}`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates,
    details: event.description || '',
    location: event.venue || 'GIK Institute, Topi',
  });

  if (event.url) {
    params.set('sprop', `website:${event.url}`);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates a direct Microsoft Outlook Live / Hotmail web calendar link.
 */
export function createOutlookCalendarUrl(event: CalendarEventData): string {
  const { startDate, endDate } = getEventDateTimes(event);

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: startDate.toISOString(),
    enddt: endDate.toISOString(),
    body: event.description || '',
    location: event.venue || 'GIK Institute, Topi',
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Generates a direct Microsoft Office 365 (work/school) web calendar link.
 */
export function createOffice365CalendarUrl(event: CalendarEventData): string {
  const { startDate, endDate } = getEventDateTimes(event);

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: startDate.toISOString(),
    enddt: endDate.toISOString(),
    body: event.description || '',
    location: event.venue || 'GIK Institute, Topi',
  });

  return `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Generates a direct Yahoo Calendar creation link.
 */
export function createYahooCalendarUrl(event: CalendarEventData): string {
  const { startDate, endDate } = getEventDateTimes(event);

  const params = new URLSearchParams({
    v: '60',
    title: event.title,
    st: formatUtcForCalendar(startDate),
    et: formatUtcForCalendar(endDate),
    desc: event.description || '',
    in_loc: event.venue || 'GIK Institute, Topi',
  });

  return `https://calendar.yahoo.com/?${params.toString()}`;
}
