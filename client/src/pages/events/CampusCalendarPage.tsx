import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar as CalendarIcon, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { eventService } from '@/services/event.service';
import { societyService } from '@/services/society.service';
import { EventCard } from '@/components/feed/EventCard';
import { CalendarEventModal } from '@/components/calendar/CalendarEventModal';
import { useDebounce } from '@/hooks/useDebounce';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';

export const CampusCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<{event: any, rect: DOMRect, bg: string, color: string} | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSociety, setSelectedSociety] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 250);
  const [searchParams] = useSearchParams();
  const viewParam = searchParams.get('view') as 'today' | 'week' | 'month' | 'upcoming' | null;
  const [listFilter, setListFilter] = useState<'today' | 'week' | 'month' | 'upcoming'>(viewParam || 'upcoming');
  const [visibleEventsCount, setVisibleEventsCount] = useState(8);

  useEffect(() => {
    if (viewParam) {
      setTimeout(() => document.getElementById('events-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    } else if (window.location.hash) {
      const id = window.location.hash.replace('#', '');
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    }
  }, [viewParam]);

  const { data: societiesData } = useQuery({
    queryKey: ['societiesListForFilter'],
    queryFn: () => societyService.getPublicSocieties({ limit: 100 }),
  });
  const societies = societiesData?.items || [];

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const {
    data: calendarEventsData,
    isLoading: isCalendarLoading,
    isError: isCalendarError,
    error: calendarError,
    refetch: refetchCalendar,
  } = useQuery({
    queryKey: ['publicCalendarEvents', startOfMonth.toISOString(), endOfMonth.toISOString(), selectedSociety, debouncedSearch],
    queryFn: () => eventService.getAllPublicEvents({ 
      from: new Date(currentDate.getFullYear(), currentDate.getMonth(), -7).toISOString(), 
      to: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 7).toISOString(), 
      societyId: selectedSociety !== 'all' ? selectedSociety : undefined, 
      limit: 100 
    }),
    placeholderData: keepPreviousData,
  });
  
  const calendarEventsList = (calendarEventsData?.items || []).filter(ev => !searchQuery || ev.title.toLowerCase().includes(searchQuery.toLowerCase()) || ev.description?.toLowerCase().includes(searchQuery.toLowerCase()));

  const filterDates = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
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
  }, [listFilter]);
  
  const {
    data: listEventsData,
    isLoading: isListLoading,
    isError: isListError,
    error: listError,
    refetch: refetchList,
  } = useQuery({
    queryKey: ['publicListEvents', listFilter, selectedSociety !== 'all' ? selectedSociety : ''],
    queryFn: () => eventService.getAllPublicEvents({ 
      from: filterDates.from, 
      to: filterDates.to, 
      societyId: selectedSociety !== 'all' ? selectedSociety : undefined, 
      limit: 40 
    }),
    placeholderData: keepPreviousData,
  });
  
  const eventsList = listEventsData?.items || [];
  const visibleEvents = eventsList.slice(0, visibleEventsCount);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedSociety('all');
    setListFilter('upcoming');
  };

  // Calendar logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = useMemo(() => {
    const arr = [];
    // Prev month cells
    for (let i = 0; i < firstDay; i++) {
      const d = daysInPrevMonth - firstDay + i + 1;
      arr.push({ day: d, isOtherMonth: true, fullDate: new Date(year, month - 1, d) });
    }
    // Current month cells
    for (let i = 1; i <= daysInMonth; i++) {
      arr.push({ day: i, isOtherMonth: false, fullDate: new Date(year, month, i) });
    }
    // Next month cells
    const remaining = arr.length % 7;
    if (remaining !== 0) {
      const needed = 7 - remaining;
      for (let i = 1; i <= needed; i++) {
        arr.push({ day: i, isOtherMonth: true, fullDate: new Date(year, month + 1, i) });
      }
    }
    return arr;
  }, [firstDay, daysInPrevMonth, daysInMonth, year, month]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const getEventsForDate = (date: Date) => {
    return calendarEventsList.filter(ev => {
      const evDate = new Date(ev.eventDate);
      return evDate.getFullYear() === date.getFullYear() && 
             evDate.getMonth() === date.getMonth() && 
             evDate.getDate() === date.getDate();
    });
  };

  const getEventColorClass = (societyName: string) => {
    const hash = societyName.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
    const classes = ['event-blue', 'event-magenta', 'event-green', 'event-orange', 'event-red'];
    return classes[Math.abs(hash) % classes.length];
  };

  const today = new Date();
  const isCurrentMonthView = currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear(); const isToday = (d: Date) => d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();

  return (
    <div className="min-h-screen text-text-primary flex justify-center py-6 px-8 sm:px-10 font-sans relative">
      <div className="w-full max-w-full flex flex-col gap-6 pb-20">
        
        {/* Page Header */}
        <h1 className="font-extrabold text-5xl sm:text-6xl text-text-primary tracking-tight leading-tight pb-4">
          Events Calendar
        </h1>
        
        {/* Top Navigation */}
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-text-primary drop-shadow-sm mr-2">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            
            {isCalendarLoading && <Loader2 className="w-4 h-4 animate-spin ml-2 text-text-muted" />}
          </div>

          <div className="flex items-center gap-2">
            {user?.role === 'SOCIETY' && (
              <button 
                className="px-4 py-2 rounded-xl bg-brand-primary text-white font-bold hover:bg-brand-primary-hover shadow-sm transition-all text-sm cursor-pointer" 
                onClick={() => navigate('/events/create')}
              >
                + New Event
              </button>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="flex flex-row gap-2.5 flex-1">
            <input 
              type="text" 
              className="campus-calendar-search-input flex-1 min-w-[120px] h-[44px]" 
              placeholder="Search events..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            
            <div className="flex gap-1 shrink-0 items-center justify-center">
              <button className="campus-calendar-glass-btn" style={{ width: "40px", height: "44px" }} onClick={prevMonth}>&lt;</button>
              <button 
                className="campus-calendar-glass-btn" 
                onClick={goToday} 
                style={{ 
                  width: "135px", 
                  height: "44px", 
                  ...( !isCurrentMonthView ? { background: "var(--text-primary)", color: "var(--bg-canvas)", fontWeight: "700" } : {})
                }}
              >
                Current Month
              </button>
              <button className="campus-calendar-glass-btn" style={{ width: "40px", height: "44px" }} onClick={nextMonth}>&gt;</button>
            </div>
          </div>

          <div className="w-full sm:w-[280px] shrink-0 h-[44px]">
            <CustomDropdown 
              className="w-full h-full"
              value={selectedSociety}
              onChange={(e: any) => setSelectedSociety(e.target.value)}
              placeholder="All Societies"
              options={[{value: 'all', label: 'All Societies'}, ...societies.map(s => ({ value: s.id, label: s.name }))]}
            />
          </div>
        </div>

        {/* Calendar Sync Error Notification */}
        {isCalendarError && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-200 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
              <span>Unable to sync latest calendar events from the campus server. Displaying cached view.</span>
            </div>
            <button
              onClick={() => refetchCalendar()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 font-bold text-xs transition-colors self-start sm:self-auto cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Sync</span>
            </button>
          </div>
        )}

        {/* Calendar Card Grid */}
        <div className="campus-calendar-card">
          <div className="campus-calendar-weekdays">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <div className="campus-calendar-grid">
            {cells.map((cell, idx) => {
              const dayEvents = getEventsForDate(cell.fullDate);
              const cellClasses = `campus-calendar-day-cell ${cell.isOtherMonth ? 'other-month' : ''} ${isToday(cell.fullDate) ? 'today' : ''}`;
              return (
                <div key={idx} className={cellClasses}>
                  <span className="campus-calendar-day-number">{cell.day}</span>
                  {dayEvents.map(ev => (
                    <div 
                      key={ev.id} 
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const computedStyle = window.getComputedStyle(e.currentTarget);
                        const bg = computedStyle.backgroundColor;
                        const color = computedStyle.color;
                        setSelectedEvent({ event: ev, rect, bg, color });
                      }}
                      className={`campus-calendar-event-tag ${getEventColorClass(ev.society?.name || 'A')} ${selectedEvent?.event.id === ev.id ? 'ring-2 ring-brand-primary shadow-sm' : ''}`}
                      title={ev.title}
                    >
                      {ev.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Events List Below Calendar */}
        <div id="events-list" className="pt-8 pb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="font-eb-garamond text-2xl font-bold text-text-primary flex items-center gap-2">
              Events 
            </h2>
            
            <div className="flex items-center flex-wrap gap-2">
              {['today', 'week', 'month', 'upcoming'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => { setListFilter(filter as any); setVisibleEventsCount(8); }}
                  className={`px-4 py-2 rounded-full font-bold text-sm border transition-all cursor-pointer ${
                    listFilter === filter
                      ? 'bg-text-primary text-bg-canvas border-text-primary shadow-sm'
                      : 'bg-surface-glass text-text-secondary border-border-subtle hover:border-border-strong hover:text-text-primary'
                  }`}
                >
                  {filter === 'today' ? 'Today' : filter === 'week' ? 'This Week' : filter === 'month' ? 'This Month' : 'All Upcoming'}
                </button>
              ))}
            </div>
          </div>
          
          {isListLoading ? (
            <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-text-muted" /></div>
          ) : isListError ? (
            <ErrorState
              error={listError}
              onRetry={refetchList}
              compact
            />
          ) : visibleEvents.length === 0 ? (
            <EmptyState
              icon={CalendarIcon}
              title="No Events Found"
              description={
                searchQuery || selectedSociety !== 'all' || listFilter !== 'upcoming'
                  ? 'No campus events match your active filters or selected timeline.'
                  : 'There are currently no campus events scheduled for this view.'
              }
              onClearFilters={
                searchQuery || selectedSociety !== 'all' || listFilter !== 'upcoming'
                  ? handleClearFilters
                  : undefined
              }
              compact
            />
          ) : (
            <>
              <div className="cards-container">
                {visibleEvents.map((event) => (
                  <EventCard key={event.id} item={{ ...event, type: 'event' } as any} />
                ))}
              </div>
              
              {eventsList.length > visibleEventsCount && (
                <div className="mt-8 flex justify-center">
                  <button 
                    onClick={() => setVisibleEventsCount(prev => prev + 8)}
                    className="campus-calendar-glass-btn !px-8 !py-3 !font-bold"
                  >
                    Load More Events
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {selectedEvent && (
        <CalendarEventModal 
          event={selectedEvent.event} 
          sourceRect={selectedEvent.rect} 
          bg={selectedEvent.bg}
          color={selectedEvent.color}
          onClose={() => setSelectedEvent(null)} 
        />
      )}
    </div>
  );
};






