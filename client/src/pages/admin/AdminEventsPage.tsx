import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Search,
  Filter,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  Building2,
  ExternalLink,
  FilterX,
  ArrowLeft,
  X,
  ArrowRight,
} from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { Alert } from '@/components/ui/Alert';
import { CustomDropdown } from '@/components/ui/CustomDropdown';

// --- 3D Flip Card Component (matches provided HTML/CSS exactly) ---
const FlippableAdminEventCard = ({ evt }: { evt: any }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isFlipped) return;
    const rect = wrapperRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    setRotation({ x: ((y - cy) / cy) * -8, y: ((x - cx) / cx) * 8 });
  };

  const handleMouseLeave = () => {
    if (!isFlipped) setRotation({ x: 0, y: 0 });
  };

  const coverImg = evt.coverImageUrl || evt.society?.logoUrl;
  const societyLogo = evt.society?.logoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
  
  const eventDate = new Date(evt.eventDate);
  const dateStr = eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = evt.startTime ? `${evt.startTime}${evt.endTime ? ' – ' + evt.endTime : ''}` : '';

  return (
    <div
      ref={wrapperRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        width: '100%',
        height: '380px',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.15s ease-out',
        transform: isFlipped ? 'rotateX(0deg) rotateY(0deg)' : `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        perspective: '1200px',
      }}
    >
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1)',
        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
      }}>

        {/* FRONT FACE */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '22px',
          overflow: 'hidden',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.12)',
          background: coverImg ? '#14161b' : 'rgba(255,255,255,0.08)',
        }}>
          {/* Cover Image */}
          {coverImg && (
            <img
              src={coverImg}
              alt={evt.title}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
            />
          )}

          {/* Overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: coverImg
              ? 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 35%, rgba(0,0,0,0.25) 65%, rgba(0,0,0,0.75) 100%)'
              : 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '22px',
            backdropFilter: coverImg ? 'none' : 'blur(20px)',
          }}>
            {/* Top badges */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{
                fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px',
                padding: '3px 10px', borderRadius: '20px',
                background: evt.isUpcoming ? 'rgba(74, 222, 128, 0.18)' : 'rgba(255,255,255,0.12)',
                border: evt.isUpcoming ? '1px solid rgba(74,222,128,0.4)' : '1px solid rgba(255,255,255,0.2)',
                color: evt.isUpcoming ? '#4ade80' : '#94a3b8',
              }}>
                {evt.isUpcoming ? 'Upcoming' : 'Past Event'}
              </span>
              {evt.society?.category && (
                <span style={{
                  fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px',
                  padding: '3px 10px', borderRadius: '20px',
                  background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: '#e2e8f0',
                }}>
                  {evt.society.category.name}
                </span>
              )}
            </div>

            {/* Bottom content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Profile + Title */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img
                    src={societyLogo}
                    alt={evt.society?.name}
                    style={{ width: '38px', height: '38px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.85)', objectFit: 'cover', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <span style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.2px', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                    {evt.society?.name}
                  </span>
                </div>
                
                <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.3, textShadow: '0 2px 8px rgba(0,0,0,0.7)', margin: 0 }}>
                  {evt.title}
                </h3>

                {/* Meta rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#e2e8f0', fontSize: '0.82rem', fontWeight: 500, textShadow: '0 2px 6px rgba(0,0,0,0.9)' }}>
                    <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, fill: 'none', stroke: '#cbd5e1', strokeWidth: 2, flexShrink: 0 }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span>{dateStr}{timeStr ? ` • ${timeStr}` : ''}</span>
                  </div>
                  {evt.venue && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#e2e8f0', fontSize: '0.82rem', fontWeight: 500, textShadow: '0 2px 6px rgba(0,0,0,0.9)' }}>
                      <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, fill: 'none', stroke: '#cbd5e1', strokeWidth: 2, flexShrink: 0 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{evt.venue}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* View Details Button */}
              <button
                onClick={(e) => { e.stopPropagation(); setIsFlipped(true); }}
                style={{
                  width: '100%', padding: '13px', borderRadius: '18px',
                  background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  border: '1px solid rgba(255,255,255,0.35)', color: '#fff',
                  fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
                  boxShadow: '0 8px 32px 0 rgba(0,0,0,0.37)',
                  textShadow: '0 2px 6px rgba(0,0,0,0.6)',
                  transition: 'background 0.25s ease, border-color 0.25s ease',
                  backfaceVisibility: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                View Details <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* BACK FACE */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '22px',
          overflow: 'hidden',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.12)',
          transform: 'rotateY(180deg)',
          background: '#16181d',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Top image section */}
          <div style={{ position: 'relative', height: '180px', flexShrink: 0 }}>
            {coverImg ? (
              <img src={coverImg} alt={evt.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={40} style={{ color: 'rgba(255,255,255,0.2)' }} />
              </div>
            )}
            <button
              onClick={(e) => { 
                  e.stopPropagation(); 
                  setIsFlipped(false); 
                  document.body.classList.remove('is-focused');
                  const backdrop = document.getElementById('global-focus-backdrop');
                  if (backdrop) backdrop.classList.remove('active');
                }}
              style={{
                position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(255,255,255,0.35)',
                boxShadow: '0 8px 24px 0 rgba(0,0,0,0.4)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                backfaceVisibility: 'hidden', zIndex: 20,
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Bottom content section */}
          <div style={{
            padding: '16px 18px', background: 'rgba(22,24,29,0.9)',
            backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            flexGrow: 1, gap: '10px', borderTop: '1px solid rgba(255,255,255,0.08)',
          }}>
            {/* Society header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
              <img src={societyLogo} alt={evt.society?.name} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <div>
                <h3 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>{evt.society?.name}</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: 0 }}>{dateStr}</p>
              </div>
            </div>

            {/* Meta */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#e2e8f0', fontSize: '0.8rem' }}>
                <svg viewBox="0 0 24 24" style={{ width: 13, height: 13, fill: 'none', stroke: '#cbd5e1', strokeWidth: 2, flexShrink: 0 }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <span>{timeStr || dateStr}</span>
              </div>
              {evt.venue && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#e2e8f0', fontSize: '0.8rem' }}>
                  <svg viewBox="0 0 24 24" style={{ width: 13, height: 13, fill: 'none', stroke: '#cbd5e1', strokeWidth: 2, flexShrink: 0 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  <span>{evt.venue}</span>
                </div>
              )}
            </div>

            {/* About */}
            {evt.description && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <h4 style={{ color: '#cbd5e1', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>About Event</h4>
                <p style={{ color: '#94a3b8', fontSize: '0.78rem', lineHeight: 1.4, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>{evt.description}</p>
              </div>
            )}

            {/* Action button */}
            {evt.registrationLink ? (
              <a
                href={evt.registrationLink}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, width: '100%', padding: '11px', background: '#ffffff', color: '#0f172a', borderRadius: '13px', fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none', transition: 'background 0.2s' }}
              >
                Register Now <ExternalLink size={13} />
              </a>
            ) : (
              <Link
                to={evt.approvalStatus === 'PENDING_ADMIN' ? `/admin/events/${evt.id}/review` : `/events/${evt.id}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, width: '100%', padding: '11px', background: '#ffffff', color: '#0f172a', borderRadius: '13px', fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none' }}
              >
                {evt.approvalStatus === 'PENDING_ADMIN' ? 'Review Event' : 'Open Event Page'} <ArrowRight size={13} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Load-More grid section
const EventGrid = ({ events }: { events: any[] }) => {
  const [visible, setVisible] = useState(4);
  const shown = events.slice(0, visible);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {shown.map((evt: any) => <FlippableAdminEventCard key={evt.id} evt={evt} />)}
      </div>
      {visible < events.length && (
        <button
          onClick={() => setVisible(v => v + 4)}
          className="w-full py-3 rounded-xl bg-white/[0.08] backdrop-blur-[20px] border border-white/20 text-white text-sm font-semibold hover:bg-white/[0.14] transition-all flex items-center justify-center gap-2"
        >
          Load More ({events.length - visible} remaining)
        </button>
      )}
    </div>
  );
};

export const AdminEventsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const rawType = searchParams.get('type');

  let defaultType: 'all' | 'this_week' | 'this_month' | 'upcoming' | 'past' = 'all';
  let defaultFrom = '';
  let defaultTo = '';

  const now = new Date();
  if (rawType === 'this_week') {
    defaultType = 'this_week';
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    defaultFrom = startOfWeek.toISOString().split('T')[0];
    defaultTo = endOfWeek.toISOString().split('T')[0];
  } else if (rawType === 'this_month') {
    defaultType = 'this_month';
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    defaultFrom = startOfMonth.toISOString().split('T')[0];
    defaultTo = endOfMonth.toISOString().split('T')[0];
  } else if (rawType === 'upcoming' || rawType === 'past') {
    defaultType = rawType;
  }

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || '');
  const [societyFilter, setSocietyFilter] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>(defaultFrom);
  const [toDate, setToDate] = useState<string>(defaultTo);
  const [typeToggle, setTypeToggle] = useState(defaultType);

  const setAllFilter = () => { setFromDate(''); setToDate(''); setTypeToggle('all'); setPage(1); };
  const setUpcomingFilter = () => { setFromDate(''); setToDate(''); setTypeToggle('upcoming'); setPage(1); };
  const setPastFilter = () => { setFromDate(''); setToDate(''); setTypeToggle('past'); setPage(1); };
  const setThisWeekFilter = () => {
    const n = new Date();
    const startOfWeek = new Date(n);
    startOfWeek.setDate(n.getDate() - n.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    setFromDate(startOfWeek.toISOString().split('T')[0]);
    setToDate(endOfWeek.toISOString().split('T')[0]);
    setTypeToggle('this_week');
    setPage(1);
  };
  const setThisMonthFilter = () => {
    const n = new Date();
    const startOfMonth = new Date(n.getFullYear(), n.getMonth(), 1);
    const endOfMonth = new Date(n.getFullYear(), n.getMonth() + 1, 0);
    setFromDate(startOfMonth.toISOString().split('T')[0]);
    setToDate(endOfMonth.toISOString().split('T')[0]);
    setTypeToggle('this_month');
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery(''); setStatusFilter(''); setSocietyFilter('');
    setFromDate(''); setToDate(''); setTypeToggle('all'); setPage(1);
  };

  const { data: eventsData, isLoading, isError } = useQuery({
    queryKey: ['adminEventsList', page, statusFilter, societyFilter, searchQuery, fromDate, toDate, typeToggle],
    queryFn: () => adminService.getAllEvents({
      page, limit: 50,
      status: statusFilter || undefined,
      society: societyFilter || undefined,
      search: searchQuery || undefined,
      from: fromDate || undefined,
      to: toDate || undefined,
      type: (typeToggle === 'upcoming' || typeToggle === 'past') ? typeToggle : undefined
    }),
  });

  const { data: societiesData } = useQuery({
    queryKey: ['adminSocietiesList-unpaginated'],
    queryFn: () => adminService.getAllSocieties({ limit: 100 }),
  });
  const societies = societiesData?.items || [];

  const events = eventsData?.items || [];
  const meta = eventsData?.meta;

  const upcomingEvents = events.filter((e: any) => e.isUpcoming);
  const pastEvents = events.filter((e: any) => !e.isUpcoming);

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-left py-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[100] inline-flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full transition-all cursor-pointer shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-1 py-6 text-left">
        <h1 className="text-4xl font-extrabold text-white">Campus Events Overview</h1>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white/[0.08] backdrop-blur-[20px] p-5 rounded-[18px] border border-white/20 space-y-4 shadow-[0_12px_40px_rgba(0,0,0,0.4)] relative" style={{ zIndex: 100 }}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80 flex items-center">
            <div className="absolute left-3 text-gray-400 pointer-events-none"><Search className="w-4 h-4" /></div>
            <input
              type="text"
              placeholder="Search event title or venue..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full bg-transparent text-white text-sm rounded-xl border border-white/20 px-3.5 py-2 pl-10 outline-none focus:border-white/40"
            />
          </div>
          <div className="flex flex-wrap items-center bg-white/5 p-1 rounded-xl border border-white/10 w-full md:w-auto gap-1">
            {['all', 'this_week', 'this_month', 'upcoming', 'past'].map(filterType => (
              <button key={filterType} onClick={() => {
                if (filterType === 'all') setAllFilter();
                else if (filterType === 'this_week') setThisWeekFilter();
                else if (filterType === 'this_month') setThisMonthFilter();
                else if (filterType === 'upcoming') setUpcomingFilter();
                else setPastFilter();
              }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${typeToggle === filterType ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-white'}`}
              >
                {filterType === 'this_week' ? 'This Week' : filterType === 'this_month' ? 'This Month' : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-white/10">
          <CustomDropdown
            icon={<Filter className="w-4 h-4" />}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'PENDING_ADMIN', label: 'Pending Review' },
              { value: 'PUBLISHED', label: 'Published / Approved' },
              { value: 'CHANGES_REQUESTED', label: 'Changes Requested' }
            ]}
            value={statusFilter}
            onChange={(val) => { setStatusFilter(val); setPage(1); }}
            placeholder="All Statuses"
          />
          <CustomDropdown
            icon={<Building2 className="w-4 h-4" />}
            options={[{ value: '', label: 'All Societies' }, ...societies.map((soc: any) => ({ value: soc.id, label: soc.name }))]}
            value={societyFilter}
            onChange={(val) => { setSocietyFilter(val); setPage(1); }}
            placeholder="All Societies"
          />
          <div className="relative flex items-center">
            <div className="absolute left-3 text-gray-400 pointer-events-none"><Calendar className="w-4 h-4" /></div>
            <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} className="w-full bg-transparent text-white text-xs rounded-xl border border-white/20 px-3 py-2 pl-9 outline-none focus:border-white/40 [color-scheme:dark]" />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex items-center w-full">
              <div className="absolute left-3 text-gray-400 pointer-events-none"><Calendar className="w-4 h-4" /></div>
              <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} className="w-full bg-transparent text-white text-xs rounded-xl border border-white/20 px-3 py-2 pl-9 outline-none focus:border-white/40 [color-scheme:dark]" />
            </div>
            {(searchQuery || societyFilter || statusFilter || fromDate || toDate || typeToggle !== 'all') && (
              <button onClick={handleClearFilters} className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-xl">
                <FilterX className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {isError && <Alert variant="error" message="Failed to load campus events overview." />}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <div className="space-y-4"><div className="h-6 w-48 bg-white/10 rounded animate-pulse"></div><div className="h-[380px] bg-white/5 rounded-[22px] animate-pulse border border-white/10"></div></div>
          <div className="space-y-4"><div className="h-6 w-48 bg-white/10 rounded animate-pulse"></div><div className="h-[380px] bg-white/5 rounded-[22px] animate-pulse border border-white/10"></div></div>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white/[0.08] backdrop-blur-[20px] p-12 rounded-[18px] border border-white/20 text-center space-y-3">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="font-bold text-white text-base">No Campus Events Found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 items-start">
          <div className="space-y-4" style={{ perspective: '1200px' }}>
            <h2 className="text-2xl font-bold text-white border-b-2 border-white/10 pb-3">Upcoming Events ({upcomingEvents.length})</h2>
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No upcoming events match the filters.</p>
            ) : (
              <EventGrid events={upcomingEvents} />
            )}
          </div>
          <div className="space-y-4" style={{ perspective: '1200px' }}>
            <h2 className="text-2xl font-bold text-white border-b-2 border-white/10 pb-3">Past Events ({pastEvents.length})</h2>
            {pastEvents.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No past events match the filters.</p>
            ) : (
              <EventGrid events={pastEvents} />
            )}
          </div>
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between p-4 bg-white/[0.08] backdrop-blur-md rounded-xl border border-white/20 mt-8">
          <p className="text-sm text-gray-400">Page {meta.page} of {meta.totalPages} · {meta.total} events</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 border border-white/10 rounded-lg disabled:opacity-50 text-white hover:bg-white/10">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages} className="p-2 border border-white/10 rounded-lg disabled:opacity-50 text-white hover:bg-white/10">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
