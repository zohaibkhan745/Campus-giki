import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomDatePickerProps {
  value?: string;
  onChange?: (val: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export function CustomDatePicker({ value, onChange, label = 'Select Date', placeholder = 'Select Date', disabled }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d;
    }
    return null;
  });

  const [yearOpen, setYearOpen] = useState(false);
  const [monthOpen, setMonthOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setSelectedDate(d);
        setViewDate(d);
      }
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  const updatePosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMenuStyle({
        position: 'absolute',
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: '300px',
        zIndex: 99999
      });
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const isInsideContainer = containerRef.current && containerRef.current.contains(event.target as Node);
      const isInsideMenu = menuRef.current && menuRef.current.contains(event.target as Node);
      if (!isInsideContainer && !isInsideMenu) {
        setIsOpen(false);
        setYearOpen(false);
        setMonthOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      updatePosition();
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    }
  }, [isOpen]);

  const handleSelectDate = (day: number) => {
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    setSelectedDate(d);
    
    // Format YYYY-MM-DD for value
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    onChange?.(`${yy}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const getDays = () => {
    const first = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
    const last = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const prevLast = new Date(viewDate.getFullYear(), viewDate.getMonth(), 0).getDate();

    const days = [];
    for (let i = first; i > 0; i--) {
      days.push({ day: prevLast - i + 1, type: 'prev' });
    }
    for (let i = 1; i <= last; i++) {
      days.push({ day: i, type: 'current' });
    }
    while (days.length < 35) {
      days.push({ day: days.length - first - last + 1, type: 'next' });
    }
    return days;
  };

  const displayLabel = selectedDate
    ? `${months[selectedDate.getMonth()].substring(0, 3)} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`
    : placeholder;

  return (
    <div className={cn("custom-picker", isOpen && "open")} ref={containerRef}>
      <button
        type="button"
        className="picker-trigger"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className="left">
          <span className="label">{displayLabel}</span>
        </span>
        <svg className="picker-arrow" viewBox="0 0 24 24">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div className="calendar-popover show" style={{ ...menuStyle }} ref={menuRef}>
          <div className="calendar-top">
            <div className={cn("mini-dropdown", yearOpen && "open")}>
              <button type="button" className="mini-btn" onClick={() => { setYearOpen(!yearOpen); setMonthOpen(false); }}>
                <span className="mini-label">{viewDate.getFullYear()}</span>
                <svg className="picker-arrow" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
              {yearOpen && (
                <div className="mini-menu" style={{ display: 'block' }}>
                  <div className="mini-list">
                    {Array.from({ length: 10 }).map((_, i) => {
                      const y = new Date().getFullYear() + i;
                      return (
                        <div
                          key={y}
                          className={cn("mini-option", y === viewDate.getFullYear() && "active")}
                          onClick={() => {
                            setViewDate(new Date(y, viewDate.getMonth(), 1));
                            setYearOpen(false);
                          }}
                        >
                          <span>{y}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className={cn("mini-dropdown", monthOpen && "open")}>
              <button type="button" className="mini-btn" onClick={() => { setMonthOpen(!monthOpen); setYearOpen(false); }}>
                <span className="mini-label">{months[viewDate.getMonth()]}</span>
                <svg className="picker-arrow" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
              {monthOpen && (
                <div className="mini-menu" style={{ display: 'block' }}>
                  <div className="mini-list">
                    {months.map((m, i) => (
                      <div
                        key={m}
                        className={cn("mini-option", i === viewDate.getMonth() && "active")}
                        onClick={() => {
                          setViewDate(new Date(viewDate.getFullYear(), i, 1));
                          setMonthOpen(false);
                        }}
                      >
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="calendar-nav">
            <button type="button" className="nav-arrow prev" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}>
              ‹
            </button>
            <span className="nav-title">{months[viewDate.getMonth()]} {viewDate.getFullYear()}</span>
            <button type="button" className="nav-arrow next" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}>
              ›
            </button>
          </div>

          <div className="day-labels">
            <div className="day-label">SUN</div>
            <div className="day-label">MON</div>
            <div className="day-label">TUE</div>
            <div className="day-label">WED</div>
            <div className="day-label">THU</div>
            <div className="day-label">FRI</div>
            <div className="day-label">SAT</div>
          </div>

          <div className="calendar-days">
            {getDays().map((d, i) => {
              const isSelected = selectedDate && d.type === 'current' && 
                                 selectedDate.getDate() === d.day && 
                                 selectedDate.getMonth() === viewDate.getMonth() && 
                                 selectedDate.getFullYear() === viewDate.getFullYear();
              
              if (d.type !== 'current') {
                return <div key={i} className="day-number inactive">{d.day}</div>;
              }
              
              return (
                <div 
                  key={i} 
                  className={cn("day-number", isSelected && "selected")}
                  onClick={() => handleSelectDate(d.day)}
                >
                  {d.day}
                </div>
              );
            })}
          </div>
        </div>
      , document.body)}
    </div>
  );
}
