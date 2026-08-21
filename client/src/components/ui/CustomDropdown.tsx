import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export interface DropdownOption {
  value: string;
  label: string;
  code?: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  variant?: 'default' | 'ghost';
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
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  const selectedOption = options.find(o => o.value === value) || { value: '', label: placeholder, code: '' };

  const updatePosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMenuStyle({
        position: 'absolute',
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        minWidth: rect.width,
        width: 'max-content',
        zIndex: 9999
      });
    }
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const isInsideContainer = containerRef.current && containerRef.current.contains(e.target as Node);
      const isInsideMenu = menuRef.current && menuRef.current.contains(e.target as Node);
      
      if (!isInsideContainer && !isInsideMenu) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      updatePosition();
    }
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen]);

  const handleSelect = (e: React.MouseEvent, val: string) => {
    e.stopPropagation();
    if (disabled) return;
    onChange(val);
    setIsOpen(false);
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
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

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div className="dropdown-menu open" style={{ ...menuStyle, display: 'block' }} ref={menuRef}>
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
        </div>,
        document.body
      )}
    </div>
  );
};
