import React, { useState, useRef, useEffect } from 'react';

export interface DropdownOption {
  value: string;
  label: string;
  code?: string; // Maps to the country code or secondary short text in the template
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  variant?: 'default' | 'ghost'; // Preserved for compatibility, but the glassmorphic theme overrides it anyway
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select...", 
  className = "",
  disabled = false,
  icon
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value) || { value: '', label: placeholder, code: '' };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleSelect = (e: React.MouseEvent, val: string) => {
    e.stopPropagation();
    if (disabled) return;
    onChange(val);
    setIsOpen(false);
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div 
      className={`dropdown-container ${isOpen ? 'open' : ''} ${className}`} 
      id="langDropdown" 
      ref={containerRef}
    >
      <button 
        className="dropdown-btn" 
        type="button" 
        onClick={toggleDropdown}
        disabled={disabled}
      >
        <div className="btn-left-content">
          {icon && <span className="text-white/70">{icon}</span>}
          {selectedOption.code && <span className="country-code">{selectedOption.code}</span>}
          <span className="language-name">{selectedOption.label}</span>
        </div>
        <svg className="arrow-icon" viewBox="0 0 24 24">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      <div className="dropdown-menu">
        <div className="dropdown-list">
          {options.map((opt) => {
            const isActive = opt.value === value;
            return (
              <div 
                key={opt.value}
                className={`dropdown-item ${isActive ? 'active' : ''}`} 
                data-code={opt.code || ''} 
                data-label={opt.label}
                onClick={(e) => handleSelect(e, opt.value)}
              >
                <div className="item-left">
                  {opt.code && <span className="country-code">{opt.code}</span>}
                  <span className="language-name">{opt.label}</span>
                </div>
                <svg className="check-icon" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
