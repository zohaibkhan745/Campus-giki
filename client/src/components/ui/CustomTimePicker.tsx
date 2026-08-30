import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface CustomTimePickerProps {
  value?: string;
  onChange?: (val: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function CustomTimePicker({ value, onChange, label = 'Select Time', placeholder = 'Select Time', disabled }: CustomTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);

  // Parse initial value if present (format HH:mm, 24h)
  const getInitialState = () => {
    let h = '09', m = '30', p = 'AM';
    if (value) {
      const [hStr, mStr] = value.split(':');
      let hr = parseInt(hStr, 10);
      if (!isNaN(hr)) {
        if (hr >= 12) {
          p = 'PM';
          if (hr > 12) hr -= 12;
        } else if (hr === 0) {
          hr = 12;
          p = 'AM';
        }
        h = String(hr).padStart(2, '0');
      }
      if (mStr) m = String(parseInt(mStr, 10)).padStart(2, '0');
    }
    return { h, m, p };
  };

  const [time, setTime] = useState(getInitialState());

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    
    // Auto-scroll to active item when opening
    if (!isOpen) {
      setTimeout(() => {
        if (hoursRef.current) {
          const active = hoursRef.current.querySelector('.time-item.active') as HTMLElement;
          if (active) hoursRef.current.scrollTop = active.offsetTop - hoursRef.current.offsetTop - 30;
        }
        if (minutesRef.current) {
          const active = minutesRef.current.querySelector('.time-item.active') as HTMLElement;
          if (active) minutesRef.current.scrollTop = active.offsetTop - minutesRef.current.offsetTop - 30;
        }
      }, 50);
    }
  };

  const applyTime = (t: { h: string, m: string, p: string }) => {
    let hr24 = parseInt(t.h, 10);
    if (t.p === 'PM' && hr24 !== 12) hr24 += 12;
    if (t.p === 'AM' && hr24 === 12) hr24 = 0;
    
    const formatted = `${String(hr24).padStart(2, '0')}:${t.m}`;
    onChange?.(formatted);
    setIsOpen(false);
  };

  const setNow = () => {
    const n = new Date();
    const rh = n.getHours();
    let rm = Math.round(n.getMinutes() / 5) * 5;
    if (rm === 60) rm = 55;
    
    const p = rh >= 12 ? "PM" : "AM";
    const h = String(rh % 12 || 12).padStart(2, "0");
    const m = String(rm).padStart(2, "0");
    
    const newTime = { h, m, p };
    setTime(newTime);
    applyTime(newTime);
  };

  // Build the time options array
  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

  const displayLabel = value 
    ? `${time.h}:${time.m} ${time.p}`
    : placeholder;

  return (
    <div className={cn("custom-picker time-picker", isOpen && "open")} ref={containerRef}>
      <button
        type="button"
        className="picker-trigger"
        onClick={handleOpen}
        disabled={disabled}
      >
        <span className="left">
          <span className="label">{displayLabel}</span>
        </span>
        <svg className="picker-arrow" viewBox="0 0 24 24">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="time-popover show" style={{ position: 'absolute', top: '100%', left: 0, width: '100%', marginTop: 8 }}>
          <div className="digital-preview">
            <span className="digits ph">{time.h}</span>
            <span className="colon">:</span>
            <span className="digits pm">{time.m}</span>
            <span className="period pp">{time.p}</span>
          </div>
          
          <div className="time-columns">
            <div className="time-column">
              <span className="column-label">Hour</span>
              <div className="scroll-list hours" ref={hoursRef}>
                {hours.map(h => (
                  <div 
                    key={h} 
                    className={cn("time-item", time.h === h && "active")}
                    onClick={() => setTime({...time, h})}
                  >
                    {h}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="time-column">
              <span className="column-label">Min</span>
              <div className="scroll-list minutes" ref={minutesRef}>
                {minutes.map(m => (
                  <div 
                    key={m} 
                    className={cn("time-item", time.m === m && "active")}
                    onClick={() => setTime({...time, m})}
                  >
                    {m}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="time-column">
              <span className="column-label">Period</span>
              <div className="scroll-list periods">
                {['AM', 'PM'].map(p => (
                  <div 
                    key={p} 
                    className={cn("time-item", time.p === p && "active")}
                    onClick={() => setTime({...time, p})}
                  >
                    {p}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="picker-actions">
            <button type="button" className="btn-action btn-now" onClick={setNow}>Now</button>
            <button type="button" className="btn-action btn-apply" onClick={() => applyTime(time)}>Apply</button>
          </div>
        </div>
      )}
    </div>
  );
}
