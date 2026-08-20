import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { EventFeedItem } from '@/types/feed.types';
import { Building2, Calendar, MapPin, ExternalLink, X } from 'lucide-react';

interface EventCardProps {
  item: EventFeedItem;
  allowExpand?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ item }) => {
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const formattedDate = new Date(item.eventDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  
  const formattedTime = new Date(item.eventDate).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const fallbackImage = 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80';
  const coverImage = item.coverImageUrl || fallbackImage;
  const logoImage = item.society.logoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';

  useEffect(() => {
    if (isFlipped) {
      document.body.classList.add('card-flipped-active');
    } else {
      document.body.classList.remove('card-flipped-active');
    }
    return () => document.body.classList.remove('card-flipped-active');
  }, [isFlipped]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isFlipped || !wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    if (!isFlipped) setRotation({ x: 0, y: 0 });
  };

  return (
    <>
      {isFlipped && (
        <div 
          className="fixed inset-0 bg-[#050507]/60 backdrop-blur-md z-40" 
          onClick={() => setIsFlipped(false)}
        />
      )}
      
      <div 
        ref={wrapperRef}
        className={`relative w-[340px] h-[490px] mx-auto z-50 transition-transform duration-150 ease-out ${isFlipped ? 'scale-105' : ''}`}
        style={{ perspective: '1200px', transform: isFlipped ? 'none' : `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div 
          className="relative w-full h-full duration-700"
          style={{ transformStyle: 'preserve-3d', transitionTimingFunction: 'cubic-bezier(0.4, 0.2, 0.2, 1)', transform: isFlipped ? 'rotateY(180deg)' : 'none' }}
        >
          {/* FRONT FACE */}
          <div 
            className="absolute inset-0 w-full h-full rounded-[18px] overflow-hidden bg-[#14161b] z-10"
            style={{ 
              backfaceVisibility: 'hidden', 
              WebkitBackfaceVisibility: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.12)',
              transform: 'translateZ(0)'
            }}
          >
            <img src={coverImage} alt={item.title} className="absolute inset-0 w-full h-full object-cover object-center" />
            
            <div 
              className="absolute inset-0 flex flex-col justify-between p-6 z-10"
              style={{
                background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.1) 35%, rgba(0, 0, 0, 0.25) 65%, rgba(0, 0, 0, 0.7) 100%)'
              }}
            >
              <div className="flex flex-col gap-3">
                <Link to={`/societies/${item.society.id}`} className="flex items-center gap-3 hover:opacity-90 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  <img src={logoImage} alt={item.society.name} className="w-11 h-11 rounded-full border-2 border-white/85 object-cover shadow-[0_4px_12px_rgba(0,0,0,0.5)]" />
                  <span className="text-white text-[1.15rem] font-bold tracking-[-0.2px] shadow-sm drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">{item.society.name}</span>
                </Link>
                
                <div className="flex flex-col gap-1.5 mt-2">
                  <div className="flex items-center gap-2 text-slate-200 text-[0.85rem] font-medium drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                    <Calendar className="w-[15px] h-[15px] text-slate-300 shrink-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
                    <span>{formattedDate} • {formattedTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200 text-[0.85rem] font-medium drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                    <MapPin className="w-[15px] h-[15px] text-slate-300 shrink-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
                    <span className="line-clamp-1">{item.venue}</span>
                  </div>
                </div>
              </div>

              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); setIsFlipped(true); }}
                className="w-full p-[15px] rounded-[14px] bg-white/15 backdrop-blur-[20px] border border-white/35 text-white text-base font-semibold tracking-[0.3px] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] outline-none hover:bg-white/25 hover:border-white/50 hover:-translate-y-0.5 transition-all duration-250 z-20"
                style={{ transform: 'translateZ(1px)' }}
              >
                View Details
              </button>
            </div>
          </div>

          {/* BACK FACE */}
          <div 
            className="absolute inset-0 w-full h-full rounded-[18px] overflow-hidden bg-[#16181d] flex flex-col"
            style={{ 
              backfaceVisibility: 'hidden', 
              WebkitBackfaceVisibility: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.12)',
              transform: 'rotateY(180deg) translateZ(0)'
            }}
          >
            <div className="relative h-[180px] w-full shrink-0">
              <img src={coverImage} alt={item.title} className="w-full h-full object-cover" />
              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
                className="absolute top-3.5 right-3.5 w-[38px] h-[38px] rounded-full bg-white/15 backdrop-blur-[20px] border border-white/35 shadow-[0_8px_24px_0_rgba(0,0,0,0.4)] text-white flex items-center justify-center hover:bg-white/30 hover:border-white/55 hover:scale-105 transition-all z-20"
                style={{ transform: 'translateZ(1px)' }}
              >
                <X className="w-5 h-5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
              </button>
            </div>

            <div className="p-[18px_20px] bg-[#16181d]/85 backdrop-blur-[16px] flex flex-col justify-between grow gap-3 border-t border-white/10 text-left">
              <div className="flex items-center gap-2.5 pb-2.5 border-b border-white/10">
                <img src={logoImage} alt={item.society.name} className="w-[38px] h-[38px] rounded-full object-cover" />
                <div>
                  <h3 className="text-white text-[0.95rem] font-semibold">{item.society.name}</h3>
                  <p className="text-slate-400 text-[0.75rem]">Posted Event</p>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-slate-200 text-[0.85rem]">
                  <Calendar className="w-[15px] h-[15px] shrink-0 text-slate-400" />
                  <span>{formattedDate} • {formattedTime}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200 text-[0.85rem]">
                  <MapPin className="w-[15px] h-[15px] shrink-0 text-slate-400" />
                  <span className="line-clamp-1">{item.venue}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <h4 className="text-slate-300 text-[0.8rem] uppercase tracking-[0.5px]">About Event</h4>
                <p className="text-slate-400 text-[0.82rem] leading-relaxed line-clamp-3">
                  {item.description}
                </p>
              </div>

              {item.registrationLink && (
                <a 
                  href={item.registrationLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full p-3 bg-white text-slate-900 rounded-[14px] text-[0.9rem] font-semibold hover:bg-slate-100 hover:-translate-y-[1px] transition-all"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>Register Now</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
