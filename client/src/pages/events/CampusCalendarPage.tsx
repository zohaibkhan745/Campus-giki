import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar as CalendarIcon, Tag, Loader2, Clock, MapPin, ExternalLink, Building2 } from 'lucide-react';
import { eventService } from '@/services/event.service';
import { societyService } from '@/services/society.service';
import { EventCard } from '@/components/feed/EventCard';

export const CampusCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>({});
  const [selectedSociety, setSelectedSociety] = useState<string>('');
  const [searchParams] = useSearchParams();
  const viewParam = searchParams.get('view') as 'today' | 'week' | 'month' | 'upcoming' | null;
  const [listFilter, setListFilter] = useState<'today' | 'week' | 'month' | 'upcoming'>(viewParam || 'upcoming');

  // Auto-scroll to events list when navigated with ?view= param or hash
  useEffect(() => {
    if (viewParam) {
      setTimeout(() => {
        document.getElementById('events-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    } else if (window.location.hash) {
      const id = window.location.hash.replace('#', '');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Query all active societies for the filter dropdown
  const { data: societiesData } = useQuery({
    queryKey: ['societiesListForFilter'],
    queryFn: () => societyService.getPublicSocieties({ limit: 100 }),
  });
  const societies = societiesData?.items || [];

  // Query 1: Visible events in calendar
  const { data: calendarEventsData, isLoading: isCalendarLoading, isFetching: isCalendarFetching } = useQuery({
    queryKey: ['publicCalendarEvents', dateRange.from, dateRange.to, selectedSociety],
    queryFn: () => eventService.getAllPublicEvents({ from: dateRange.from, to: dateRange.to, societyId: selectedSociety || undefined, limit: 150 }),
    enabled: !!dateRange.from && !!dateRange.to,
    placeholderData: keepPreviousData,
  });
  
  const calendarEventsList = calendarEventsData?.items || [];

  // Query 2: Events for the list filter
  const getFilterDates = () => {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    if (listFilter === 'today') {
      const toDate = new Date(today);
      toDate.setDate(today.getDate() + 1);
      return { from: today.toISOString(), to: toDate.toISOString() };
    }
    if (listFilter === 'week') {
      const toDate = new Date(today);
      toDate.setDate(today.getDate() + 7);
      return { from: today.toISOString(), to: toDate.toISOString() };
    }
    if (listFilter === 'month') {
      const toDate = new Date(today);
      toDate.setMonth(today.getMonth() + 1);
      return { from: today.toISOString(), to: toDate.toISOString() };
    }
    return { from: today.toISOString(), to: undefined };
  };
  
  const filterDates = getFilterDates();
  
  const { data: listEventsData, isLoading: isListLoading } = useQuery({
    queryKey: ['publicListEvents', listFilter, selectedSociety],
    queryFn: () => eventService.getAllPublicEvents({ from: filterDates.from, to: filterDates.to, societyId: selectedSociety || undefined, limit: 150 }),
    placeholderData: keepPreviousData,
  });
  
  const eventsList = listEventsData?.items || [];

  // Helper to parse "06:00 PM" into FullCalendar compatible local ISO "YYYY-MM-DDTHH:mm:00"
  const parseLocalIso = (dateStr: string, timeStr: string) => {
    let hours = 0;
    let minutes = 0;
    let addDay = false;
    
    if (timeStr) {
      const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (match) {
        hours = parseInt(match[1], 10);
        minutes = parseInt(match[2], 10);
        const modifier = match[3]?.toUpperCase();
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
      }
      if (timeStr.toLowerCase().includes('next day')) {
        addDay = true;
      }
    }
    
    const dt = new Date(dateStr); // Parses YYYY-MM-DD as UTC midnight
    if (addDay) {
      dt.setUTCDate(dt.getUTCDate() + 1);
    }
    
    const yyyy = dt.getUTCFullYear();
    const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(dt.getUTCDate()).padStart(2, '0');
    const hh = String(hours).padStart(2, '0');
    const min = String(minutes).padStart(2, '0');
    
    return `${yyyy}-${mm}-${dd}T${hh}:${min}:00`;
  };

  // Map backend EventItem items to FullCalendar format
  const calendarEvents = calendarEventsList.map((item) => {
    const eventDateStr = new Date(item.eventDate).toISOString().split('T')[0];
    const startIso = parseLocalIso(eventDateStr, item.startTime);
    const endIso = parseLocalIso(eventDateStr, item.endTime);

    // Simple hash to generate a consistent color for a society
    const hash = (item.society?.name || 'A').split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
    const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#f43f5e', '#06b6d4', '#ec4899', '#6366f1'];
    const color = colors[Math.abs(hash) % colors.length];

    return {
      id: item.id,
      title: item.title,
      start: startIso,
      end: endIso,
      backgroundColor: color,
      borderColor: color,
      textColor: '#ffffff',
      extendedProps: {
        societyName: item.society?.name || 'Campus Society',
        venue: item.venue,
        startTime: item.startTime,
        endTime: item.endTime,
      },
    };
  });

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const calendarPlugins = [
    dayGridPlugin as any,
    timeGridPlugin as any,
    interactionPlugin as any,
  ];

  return (
    <div className="bg-lumen-cream text-vast-ink min-h-screen pt-4 md:pt-14 pb-12 font-figtree">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 space-y-10 text-left">
        {/* Page Header */}
        <header className="space-y-3 pb-8">
          <h1 className="font-eb-garamond text-heading-lg text-vast-ink leading-tight">
            Campus Events Calendar
          </h1>
          <p className="text-body text-vast-ink/80 max-w-2xl">
            Explore upcoming hackathons, sports tournaments, workshops, and society events across GIKI.
          </p>
        </header>

        {/* Controls Bar */}
        <div className="bg-lumen-cream border border-vast-ink/20 rounded-cards p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {(isCalendarLoading || isCalendarFetching || isListLoading) && (
              <div className="flex items-center gap-1.5 text-xs text-vast-ink font-semibold bg-lavender-whisper px-3 py-1.5 rounded-badges border border-vast-ink/20 shrink-0">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Loading...</span>
              </div>
            )}

            <div className="relative flex items-center w-full sm:w-64">
              <div className="absolute left-3 text-vast-ink/60 pointer-events-none flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <select
                value={selectedSociety}
                onChange={(e) => setSelectedSociety(e.target.value)}
                className="w-full bg-lumen-cream text-vast-ink font-bold text-xs rounded-inputs border border-vast-ink/20 px-3.5 py-2.5 pl-10 transition-all outline-none focus:ring-2 focus:ring-vast-ink cursor-pointer"
              >
                <option value="" className="bg-lumen-cream text-vast-ink font-semibold">All Societies</option>
                {societies.map((soc) => (
                  <option key={soc.id} value={soc.id} className="bg-lumen-cream text-vast-ink font-semibold">
                    {soc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Calendar Container */}
        <div id="calendar-view" className="bg-lumen-cream border border-vast-ink/20 rounded-cards sm:rounded-[32px] overflow-hidden p-3 sm:p-6 text-vast-ink shadow-none">
            <style>{`
              .fc {
                table-layout: fixed !important;
                font-family: inherit !important;
              }
              .fc-daygrid-day-frame {
                overflow: hidden !important;
                max-width: 100% !important;
                min-height: 52px !important;
              }
              .fc-daygrid-event-harness {
                margin-bottom: 2px !important;
                max-width: 100% !important;
                overflow: hidden !important;
              }
              .fc-dayGridMonth-view .fc-daygrid-event {
                background: transparent !important;
                border: none !important;
                box-shadow: none !important;
                padding: 1px 0 !important;
                margin: 1px 0 !important;
                max-width: 100% !important;
                overflow: hidden !important;
              }
              .fc-event-main {
                overflow: hidden !important;
                width: 100% !important;
                max-width: 100% !important;
                text-overflow: ellipsis !important;
                white-space: nowrap !important;
              }
              .fc-theme-standard td, .fc-theme-standard th {
                border-color: rgba(30, 41, 59, 0.15) !important;
              }

              /* Mobile CSS Overrides */
              @media (max-width: 640px) {
                .fc .fc-toolbar {
                  flex-direction: column !important;
                  gap: 8px !important;
                  align-items: center !important;
                }
                .fc .fc-toolbar-title {
                  font-size: 1.1rem !important;
                  font-weight: 800 !important;
                }
                .fc .fc-button {
                  padding: 4px 10px !important;
                  font-size: 0.75rem !important;
                  font-weight: 700 !important;
                  border-radius: 8px !important;
                }
                .fc-col-header-cell-cushion {
                  font-size: 0.7rem !important;
                  font-weight: 800 !important;
                  text-transform: uppercase !important;
                  padding: 4px 2px !important;
                }
                .fc-daygrid-day-number {
                  font-size: 0.75rem !important;
                  font-weight: 700 !important;
                  padding: 2px 4px !important;
                }
              }
            `}</style>
          <FullCalendar
            key="dayGridMonth" // Force re-render on initial view change to ensure it mounts correctly
            plugins={calendarPlugins}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next',
              center: 'title',
              right: '',
            }}
            editable={false}
            selectable={false}
            events={calendarEvents}
            datesSet={(arg) => {
              const fromStr = arg.startStr.split('T')[0];
              const toStr = arg.endStr.split('T')[0];
              setDateRange({ from: fromStr, to: toStr });
            }}
            eventClick={(arg) => {
              navigate(`/events/${arg.event.id}`);
            }}
            height="auto"
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              meridiem: false,
              hour12: false,
            }}
            displayEventTime={false}
            eventContent={(eventInfo) => {
              const color = eventInfo.event.backgroundColor || '#3b82f6';
              const title = eventInfo.event.title;

              if (eventInfo.view.type === 'dayGridMonth') {
                return (
                  <div
                    className="w-full max-w-full flex items-center gap-1 px-1.5 py-0.5 rounded transition-all duration-150 hover:opacity-90 cursor-pointer overflow-hidden box-border"
                    style={{
                      backgroundColor: `${color}20`,
                      borderLeft: `3px solid ${color}`,
                    }}
                    title={title}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0 hidden sm:inline-block"
                      style={{ backgroundColor: color }}
                    />
                    <span
                      className="text-[11px] font-bold truncate block w-full leading-tight text-left"
                      style={{ color: '#0f172a' }}
                    >
                      {title}
                    </span>
                  </div>
                );
              }
              // For week and day views, let FullCalendar render natively
              return undefined;
            }}
          />
        </div>

        {/* Detailed Events List Below Calendar */}
        <div id="events-list" className="pt-8 pb-12">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="font-eb-garamond text-2xl font-bold text-vast-ink flex items-center gap-2">
              <CalendarIcon className="w-6 h-6" />
              Events 
            </h2>
            
            <div className="flex items-center flex-wrap gap-2">
              <button
                onClick={() => setListFilter('today')}
                className={`px-4 py-2 rounded-full font-bold text-sm border transition-all ${
                  listFilter === 'today'
                    ? 'bg-vast-ink text-pure-white border-vast-ink'
                    : 'bg-transparent text-vast-ink border-vast-ink/20 hover:border-vast-ink'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setListFilter('week')}
                className={`px-4 py-2 rounded-full font-bold text-sm border transition-all ${
                  listFilter === 'week'
                    ? 'bg-vast-ink text-pure-white border-vast-ink'
                    : 'bg-transparent text-vast-ink border-vast-ink/20 hover:border-vast-ink'
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => setListFilter('month')}
                className={`px-4 py-2 rounded-full font-bold text-sm border transition-all ${
                  listFilter === 'month'
                    ? 'bg-vast-ink text-pure-white border-vast-ink'
                    : 'bg-transparent text-vast-ink border-vast-ink/20 hover:border-vast-ink'
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => setListFilter('upcoming')}
                className={`px-4 py-2 rounded-full font-bold text-sm border transition-all ${
                  listFilter === 'upcoming'
                    ? 'bg-vast-ink text-pure-white border-vast-ink'
                    : 'bg-transparent text-vast-ink border-vast-ink/20 hover:border-vast-ink'
                }`}
              >
                All Upcoming
              </button>
            </div>
          </div>
          
          {eventsList.length === 0 ? (
            <div className="bg-transparent p-10 rounded-cards border border-vast-ink/20 text-center text-fog">
              No events scheduled for the current date range.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventsList.map((event) => (
                <EventCard key={event.id} item={{ ...event, type: 'event' } as any} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
