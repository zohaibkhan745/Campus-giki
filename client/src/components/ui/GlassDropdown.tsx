import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface GlassDropdownProps {
  value?: string;
  onChange?: (val: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  disabled?: boolean;
}

export function GlassDropdown({ value, onChange, options, placeholder = 'Select Option', disabled }: GlassDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    onChange?.(val);
    setIsOpen(false);
  };

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className={cn("simple-picker", isOpen && "open")} ref={containerRef}>
      <button
        type="button"
        className="picker-trigger"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className="left">
          <span className="label">{selectedOption ? selectedOption.label : placeholder}</span>
        </span>
        <svg className="picker-arrow" viewBox="0 0 24 24">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="dropdown-menu open" style={{ position: 'absolute', top: '100%', left: 0, width: '100%', marginTop: 8 }}>
          <div className="dropdown-list" style={{ maxHeight: 260 }}>
            {options.map(opt => (
              <div
                key={opt.value}
                className={cn("dropdown-item", opt.value === value && "active")}
                onClick={() => handleSelect(opt.value)}
              >
                <div className="item-left">
                  <span className="language-name">{opt.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
