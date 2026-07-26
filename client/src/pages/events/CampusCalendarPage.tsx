import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Tag, Loader2, Info } from 'lucide-react';
import { eventService } from '@/services/event.service';
import { societyService } from '@/services/society.service';

const CATEGORY_COLORS: Record<string, string> = {
  technology: '#3b82f6', // Blue
  sports: '#10b981', // Emerald
  'arts-and-culture': '#8b5cf6', // Purple
  academic: '#f59e0b', // Amber
  media: '#f43f5e', // Rose
  'community-service': '#06b6d4', // Cyan
  entrepreneurship: '#ec4899', // Pink
  religious: '#6366f1', // Indigo
  other: '#64748b', // Slate
};

export const CampusCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Responsive calendar view state
  const [calendarView, setCalendarView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('dayGridMonth');
  const [calendarHeaderRight, setCalendarHeaderRight] = useState('dayGridMonth,timeGridWeek,timeGridDay');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setCalendarView('timeGridDay');
        setCalendarHeaderRight('timeGridWeek,timeGridDay');
      } else if (width >= 768 && width < 1024) {
        setCalendarView('timeGridWeek');
        setCalendarHeaderRight('dayGridMonth,timeGridWeek,timeGridDay');
      } else {
        setCalendarView('dayGridMonth');
        setCalendarHeaderRight('dayGridMonth,timeGridWeek,timeGridDay');
      }
    };

    handleResize(); // Init on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Query predefined categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: societyService.getCategories,
  });

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
      selectedCategory,
    ],
    queryFn: () =>
      eventService.getAllPublicEvents({
        from: dateRange.from,
        to: dateRange.to,
        category: selectedCategory || undefined,
        limit: 150,
      }),
    enabled: !!dateRange.from && !!dateRange.to,
  });

  const eventsList = eventsData?.items || [];

  // Map backend EventItem items to FullCalendar format with category color coding
  const calendarEvents = eventsList.map((item) => {
    const catSlug = item.society?.category?.slug || 'other';
    const color = CATEGORY_COLORS[catSlug] || CATEGORY_COLORS.other;

    const eventDateStr = new Date(item.eventDate).toISOString().split('T')[0];
    const startIso = `${eventDateStr}T${item.startTime}:00`;
    const endIso = `${eventDateStr}T${item.endTime}:00`;

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
        categoryName: item.society?.category?.name || 'General',
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
    <div className="bg-lumen-cream text-vast-ink min-h-screen py-8 font-figtree">
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
        <div className="bg-lumen-cream border-2 border-vast-ink rounded-cards p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            {(isLoading || isFetching) && (
              <div className="flex items-center gap-1.5 text-xs text-vast-ink font-semibold bg-lavender-whisper px-3 py-1.5 rounded-badges border-2 border-vast-ink">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Fetching events...</span>
              </div>
            )}

            <div className="relative flex items-center w-full md:w-56">
              <div className="absolute left-3 text-vast-ink/60 pointer-events-none flex items-center justify-center">
                <Tag className="w-4 h-4" />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-lumen-cream text-vast-ink font-medium text-sm rounded-buttons border-2 border-vast-ink px-3.5 py-2 pl-10 transition-all outline-none focus:bg-lumen-stone appearance-none cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Category Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
            {Object.entries(CATEGORY_COLORS).map(([slug, color]) => (
              <div key={slug} className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full border-2 border-vast-ink inline-block"
                  style={{ backgroundColor: color }}
                />
                <span className="capitalize text-vast-ink/80">
                  {slug.replace(/-/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* FullCalendar Component Panel */}
        <div className="bg-lumen-cream border-2 border-vast-ink rounded-[32px] overflow-hidden p-4 sm:p-6 text-vast-ink shadow-none">
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
            eventContent={(eventInfo) => {
              const props = eventInfo.event.extendedProps as {
                societyName: string;
                categoryName: string;
                venue: string;
                startTime: string;
                endTime: string;
              };
              return (
                <div
                  className="p-1 text-xs cursor-pointer truncate space-y-0.5"
                  title={`${eventInfo.event.title} - ${props.societyName} (${props.startTime} - ${props.endTime})`}
                >
                  <div className="font-semibold truncate text-lumen-cream drop-shadow-sm">{eventInfo.event.title}</div>
                  <div className="text-[10px] opacity-90 truncate text-lumen-cream drop-shadow-sm">
                    {props.societyName}
                  </div>
                </div>
              );
            }}
          />
        </div>
      </div>
    </div>
  );
};
