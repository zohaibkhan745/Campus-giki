import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Tag, Loader2, Clock, MapPin, ExternalLink, Building2 } from 'lucide-react';
import { eventService } from '@/services/event.service';
import { societyService } from '@/services/society.service';

export const CampusCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>({});
  const [selectedSociety, setSelectedSociety] = useState<string>('');
  const [activeTabMode, setActiveTabMode] = useState<'grid' | 'list'>('grid');

  // Responsive calendar view state
  const [calendarView, setCalendarView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('dayGridMonth');
  const [calendarHeaderRight, setCalendarHeaderRight] = useState('dayGridMonth,timeGridWeek,timeGridDay');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setCalendarHeaderRight('today');
      } else if (width < 768) {
        setCalendarHeaderRight('prev,next today');
      } else {
        setCalendarHeaderRight('dayGridMonth,timeGridWeek,timeGridDay');
      }
    };

    handleResize(); // Init on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Query all active societies for the filter dropdown
  const { data: societiesData } = useQuery({
    queryKey: ['societiesListForFilter'],
    queryFn: () => societyService.getPublicSocieties({ limit: 100 }),
  });
  const societies = societiesData?.items || [];

  // Query visible events in active date range [from, to]
  const {
    data: eventsData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [
      'publicCalendarEvents',
      dateRange.from,
      dateRange.to,
      selectedSociety,
    ],
    queryFn: () =>
      eventService.getAllPublicEvents({
        from: dateRange.from,
        to: dateRange.to,
        societyId: selectedSociety || undefined,
        limit: 150,
      }),
    enabled: !!dateRange.from && !!dateRange.to,
  });

  const eventsList = eventsData?.items || [];

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
  const calendarEvents = eventsList.map((item) => {
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
        <header className="space-y-3 border-b-2 border-vast-ink/10 pb-8">
          <h1 className="font-eb-garamond text-heading-lg text-vast-ink leading-tight">
            Campus Events Calendar
          </h1>
          <p className="text-body text-vast-ink/80 max-w-2xl">
            Explore upcoming hackathons, sports tournaments, workshops, and society events across GIKI.
          </p>
        </header>

        {/* Controls Bar */}
        <div className="bg-lumen-cream border-2 border-vast-ink rounded-cards p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {(isLoading || isFetching) && (
              <div className="flex items-center gap-1.5 text-xs text-vast-ink font-semibold bg-lavender-whisper px-3 py-1.5 rounded-badges border-2 border-vast-ink shrink-0">
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
                className="w-full bg-pure-white text-vast-ink font-bold text-xs rounded-inputs border-2 border-vast-ink px-3.5 py-2.5 pl-10 transition-all outline-none focus:ring-2 focus:ring-vast-ink cursor-pointer"
              >
                <option value="">All Societies</option>
                {societies.map((soc) => (
                  <option key={soc.id} value={soc.id}>
                    {soc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* View Mode Toggle (Grid vs Mobile Agenda) */}
          <div className="flex items-center gap-1 bg-pure-white p-1 rounded-inputs border-2 border-vast-ink self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTabMode('grid')}
              className={`px-3 py-1.5 text-xs font-bold rounded-inputs transition-colors ${
                activeTabMode === 'grid'
                  ? 'bg-vast-ink text-white shadow-sm'
                  : 'text-vast-ink hover:bg-lumen-stone'
              }`}
            >
              📅 Month Grid
            </button>
            <button
              type="button"
              onClick={() => setActiveTabMode('list')}
              className={`px-3 py-1.5 text-xs font-bold rounded-inputs transition-colors ${
                activeTabMode === 'list'
                  ? 'bg-vast-ink text-white shadow-sm'
                  : 'text-vast-ink hover:bg-lumen-stone'
              }`}
            >
              📋 Agenda Cards
            </button>
          </div>
        </div>

        {/* Calendar / Agenda View Container */}
        {activeTabMode === 'grid' ? (
          <div className="bg-lumen-cream border-2 border-vast-ink rounded-cards sm:rounded-[32px] overflow-hidden p-3 sm:p-6 text-vast-ink shadow-none">
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
            key={calendarView} // Force re-render on initial view change to ensure it mounts correctly
            plugins={calendarPlugins}
            initialView={calendarView}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: calendarHeaderRight,
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
        ) : null}

        {/* Detailed Events List Below Calendar */}
        <div className="pt-8 pb-12">
          <h2 className="font-eb-garamond text-2xl font-bold text-vast-ink mb-6 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6" />
            Events in Selected View
          </h2>
          
          {eventsList.length === 0 ? (
            <div className="bg-pure-white p-10 rounded-cards border-2 border-vast-ink text-center text-fog">
              No events scheduled for the current date range.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventsList.map((event) => (
                <div
                  key={event.id}
                  onClick={() => navigate(`/events/${event.id}`)}
                  className="bg-pure-white rounded-cards border-2 border-vast-ink hover:translate-y-[-4px] hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between overflow-hidden"
                >
                  <div className="space-y-4 p-5">
                    {event.coverImageUrl && (
                      <div className="w-full h-32 -mx-5 -mt-5 mb-4 border-b-2 border-vast-ink overflow-hidden bg-lumen-stone">
                        <img
                          src={event.coverImageUrl}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-lg text-vast-ink leading-tight line-clamp-2">
                        {event.title}
                      </h4>
                    </div>

                    <p className="text-sm text-fog line-clamp-2">{event.description}</p>

                    <div className="space-y-2 text-sm text-vast-ink font-medium pt-2 border-t-2 border-vast-ink/10">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-vast-ink shrink-0" />
                        <span>{new Date(event.eventDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-vast-ink shrink-0" />
                        <span>{event.startTime} - {event.endTime}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-forest-ink shrink-0" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-ember-glow shrink-0" />
                        <span className="truncate">{event.society?.name || 'Campus Society'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
