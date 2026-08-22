import React, { useState, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { eventService } from '@/services/event.service';
import { societyService } from '@/services/society.service';
import { EventCard } from '@/components/feed/EventCard';

export const CampusCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSociety, setSelectedSociety] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams] = useSearchParams();
  const viewParam = searchParams.get('view') as 'today' | 'week' | 'month' | 'upcoming' | null;
  const [listFilter, setListFilter] = useState<'today' | 'week' | 'month' | 'upcoming'>(viewParam || 'upcoming');
  const [visibleEventsCount, setVisibleEventsCount] = useState(6);

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

  const { data: calendarEventsData, isLoading: isCalendarLoading } = useQuery({
    queryKey: ['publicCalendarEvents', startOfMonth.toISOString(), endOfMonth.toISOString(), selectedSociety, searchQuery],
    queryFn: () => eventService.getAllPublicEvents({ 
      from: new Date(currentDate.getFullYear(), currentDate.getMonth(), -7).toISOString(), 
      to: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 7).toISOString(), 
      societyId: selectedSociety !== 'all' ? selectedSociety : undefined,
      limit: 150 
    }),
    placeholderData: keepPreviousData,
  });
  
  const calendarEventsList = (calendarEventsData?.items || []).filter(ev => !searchQuery || ev.title.toLowerCase().includes(searchQuery.toLowerCase()) || ev.description?.toLowerCase().includes(searchQuery.toLowerCase()));

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
    queryKey: ['publicListEvents', listFilter, selectedSociety !== 'all' ? selectedSociety : ''],
    queryFn: () => eventService.getAllPublicEvents({ 
      from: filterDates.from, 
      to: filterDates.to, 
      societyId: selectedSociety !== 'all' ? selectedSociety : undefined, 
      limit: 150 
    }),
    placeholderData: keepPreviousData,
  });
  
  const eventsList = listEventsData?.items || [];
  const visibleEvents = eventsList.slice(0, visibleEventsCount);

  // Calendar logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];
  // Prev month cells
  for (let i = 0; i < firstDay; i++) {
    const d = daysInPrevMonth - firstDay + i + 1;
    cells.push({ day: d, isOtherMonth: true, fullDate: new Date(year, month - 1, d) });
  }
  // Current month cells
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ day: i, isOtherMonth: false, fullDate: new Date(year, month, i) });
  }
  // Next month cells
  const remaining = cells.length % 7;
  if (remaining !== 0) {
    const needed = 7 - remaining;
    for (let i = 1; i <= needed; i++) {
      cells.push({ day: i, isOtherMonth: true, fullDate: new Date(year, month + 1, i) });
    }
  }

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
    <div className="min-h-screen text-white flex justify-center py-6 px-3 font-sans relative">
      
      <style>{`
        .glass-btn {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          padding: 7px 12px;
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.2s ease;
        }
        .glass-btn:hover { background: rgba(255, 255, 255, 0.16); border-color: rgba(255, 255, 255, 0.25); }
        
        .btn-group {
          display: flex;
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 8px;
          overflow: hidden;
        }
        .btn-group .glass-btn { border: none; border-radius: 0; background: transparent; padding: 8px 12px; }
        .btn-group .glass-btn.active { background: rgba(255, 255, 255, 0.2); }
        
        .btn-primary {
          background: rgba(255, 255, 255, 0.9);
          color: #000000;
          font-weight: 600;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          padding: 8px 14px;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.2s ease;
        }
        .btn-primary:hover { background: #ffffff; }
        
        .search-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 8px;
          padding: 10px 14px;
          color: #fff;
          outline: none;
          font-size: 0.9rem;
        }
        .search-input::placeholder { color: rgba(255, 255, 255, 0.4); }
        .search-input:focus { border-color: rgba(255, 255, 255, 0.3); }
        
        .select-dropdown {
          background: rgba(30, 30, 35, 0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          padding: 7px 12px;
          font-size: 0.85rem;
          outline: none;
          cursor: pointer;
        }
        .select-dropdown option { background: #18181c; color: #ffffff; }
        
        .calendar-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
          border-radius: 12px;
          overflow: hidden;
          width: 100%;
        }
        
        .weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding: 10px 0;
          font-size: 0.85rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.85);
        }
        
        .cal-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
        }
        
        .day-cell {
          min-height: 105px;
          border-right: 1px solid rgba(255, 255, 255, 0.06);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          padding: 6px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          overflow: hidden;
        }
        .day-cell:nth-child(7n) { border-right: none; }
        
        .day-number {
          font-size: 0.85rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 2px;
        }
        .day-cell.other-month .day-number { color: rgba(255, 255, 255, 0.25); }
        .day-cell.today .day-number {
          background: #ffffff;
          color: #000000;
          border-radius: 50%;
          width: 22px;
          height: 22px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }
        
        .event-tag {
          font-size: 0.75rem;
          padding: 3px 6px;
          border-radius: 4px;
          color: #ffffff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-weight: 500;
          border: 1px solid rgba(255, 255, 255, 0.15);
          cursor: pointer;
        }
        .event-blue { background: rgba(37, 99, 235, 0.55); }
        .event-magenta { background: rgba(219, 39, 119, 0.55); }
        .event-green { background: rgba(22, 163, 74, 0.55); }
        .event-orange { background: rgba(234, 88, 12, 0.55); }
        .event-red { background: rgba(220, 38, 38, 0.55); }
        
        @media (max-width: 768px) {
          .day-cell { min-height: 70px; padding: 4px 2px; gap: 2px; }
          .day-number { font-size: 0.75rem; }
          .day-cell.today .day-number { width: 18px; height: 18px; font-size: 0.7rem; }
          .event-tag { font-size: 0.65rem; padding: 2px 4px; border-radius: 2px; }
        }
        @media (max-width: 480px) {
          .weekdays div { font-size: 0.75rem; }
          .day-cell { min-height: 55px; }
          .event-tag { font-size: 0.6rem; padding: 1px 3px; }
        }
      `}</style>

      <div className="w-full max-w-[1100px] flex flex-col gap-6 mt-10">
        
        {/* Page Header */}
        <h1 className="font-extrabold text-5xl sm:text-6xl text-white tracking-tight leading-tight pb-4">
          Events Calendar
        </h1>
        
        {/* Top Navigation */}
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold drop-shadow-md mr-2">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-1">
              <button className="glass-btn" onClick={prevMonth}>&lt;</button>
              <button className={`glass-btn ${!isCurrentMonthView ? "current-month-btn" : ""}`} onClick={goToday} style={!isCurrentMonthView ? { background: "#ffffff", color: "#000000", fontWeight: "600" } : {}}>Current Month</button>
              <button className="glass-btn" onClick={nextMonth}>&gt;</button>
            </div>
            {isCalendarLoading && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
          </div>

          <div className="flex items-center gap-2">
            {user?.role === 'SOCIETY' && (
              <button className="btn-primary" onClick={() => navigate('/events/create')}>+ New Event</button>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input 
            type="text" 
            className="search-input flex-1" 
            placeholder="Search events..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          
          <div className="w-full sm:w-[280px] shrink-0">
            <CustomDropdown 
              className="w-full"
              value={selectedSociety}
              onChange={setSelectedSociety}
              placeholder="All Societies"
              options={[{value: 'all', label: 'All Societies'}, ...societies.map(s => ({ value: s.id, label: s.name }))]}
            />
          </div>
        </div>

        {/* Calendar Card Grid */}
        <div className="calendar-card">
          <div className="weekdays">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <div className="cal-grid">
            {cells.map((cell, idx) => {
              const dayEvents = getEventsForDate(cell.fullDate);
              const cellClasses = `day-cell ${cell.isOtherMonth ? 'other-month' : ''} ${isToday(cell.fullDate) ? 'today' : ''}`;
              return (
                <div key={idx} className={cellClasses}>
                  <span className="day-number">{cell.day}</span>
                  {dayEvents.map(ev => (
                    <div 
                      key={ev.id} 
                      onClick={() => navigate(`/events/${ev.id}`)}
                      className={`event-tag ${getEventColorClass(ev.society?.name || 'A')}`}
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
            <h2 className="font-eb-garamond text-2xl font-bold text-white flex items-center gap-2">
              <CalendarIcon className="w-6 h-6" />
              Events 
            </h2>
            
            <div className="flex items-center flex-wrap gap-2">
              {['today', 'week', 'month', 'upcoming'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => { setListFilter(filter as any); setVisibleEventsCount(6); }}
                  className={`px-4 py-2 rounded-full font-bold text-sm border transition-all ${
                    listFilter === filter
                      ? 'bg-white text-gray-900 border-white'
                      : 'bg-transparent text-gray-300 border-white/20 hover:border-white'
                  }`}
                >
                  {filter === 'today' ? 'Today' : filter === 'week' ? 'This Week' : filter === 'month' ? 'This Month' : 'All Upcoming'}
                </button>
              ))}
            </div>
          </div>
          
          {isListLoading ? (
            <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-white/50" /></div>
          ) : visibleEvents.length === 0 ? (
            <div className="bg-transparent p-10 rounded-xl border border-white/10 text-center text-gray-400">
              No events scheduled for the current filter.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleEvents.map((event) => (
                  <EventCard key={event.id} item={{ ...event, type: 'event' } as any} />
                ))}
              </div>
              
              {eventsList.length > visibleEventsCount && (
                <div className="mt-8 flex justify-center">
                  <button 
                    onClick={() => setVisibleEventsCount(prev => prev + 6)}
                    className="glass-btn !px-8 !py-3 !font-bold"
                  >
                    Load More Events
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
