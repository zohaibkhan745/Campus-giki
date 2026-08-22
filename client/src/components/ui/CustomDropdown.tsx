import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { createPortal } from 'react-dom';

export interface DropdownOption {
  value: string;
  label: string;
  code?: string;
}

interface CustomDropdownProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: DropdownOption[];
  value?: string;
  onChange?: any;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export const CustomDropdown = forwardRef<HTMLSelectElement, CustomDropdownProps>(({ 
  options, 
  value: controlledValue, 
  onChange, 
  placeholder = "Select...", 
  className = "",
  disabled = false,
  name,
  onBlur,
  ...rest
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(controlledValue || '');
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  const currentValue = controlledValue !== undefined ? controlledValue : internalValue;
  const selectedOption = options.find(o => o.value === currentValue) || { value: '', label: placeholder, code: '' };

  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue]);

  // Global close listener so only one dropdown opens at a time
  useEffect(() => {
    const handleGlobalClose = () => setIsOpen(false);
    window.addEventListener('close-custom-dropdowns', handleGlobalClose);
    return () => window.removeEventListener('close-custom-dropdowns', handleGlobalClose);
  }, []);

  const updatePosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMenuStyle({
        position: 'absolute',
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width,
        zIndex: 99999
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
      document.addEventListener('click', handleOutsideClick);
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      updatePosition();
    }
    
    return () => {
      document.removeEventListener('click', handleOutsideClick);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen]);

  const handleSelect = (e: React.MouseEvent, val: string) => {
    e.stopPropagation();
    if (disabled) return;
    
    setInternalValue(val);
    
    if (onChange) {
      const event = {
        target: { name, value: val },
        currentTarget: { name, value: val }
      } as any;
      onChange(event);
    }
    setIsOpen(false);
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      if (!isOpen) {
        window.dispatchEvent(new CustomEvent('close-custom-dropdowns'));
      }
      setIsOpen(!isOpen);
    }
  };

  const cleanClassName = (className || '').replace(/bg-[\w-\[\]\.]+/g, '').replace(/border-[\w-\/]+/g, '').replace(/text-[\w-\/]+/g, '').replace(/rounded-[\w-\/]+/g, '');

  return (
    <div 
      className={`dropdown-container ${isOpen ? 'open' : ''} ${cleanClassName}`} 
      ref={containerRef}
      style={{ position: 'relative', width: '100%' }}
    >
      <select 
        ref={ref} 
        name={name} 
        value={currentValue}
        onChange={(e) => {
          setInternalValue(e.target.value);
          if (onChange) onChange(e);
        }}
        onBlur={onBlur}
        style={{ display: 'none' }}
        disabled={disabled}
        {...rest}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>

      <button 
        className="dropdown-btn" 
        type="button" 
        onClick={toggleDropdown}
        disabled={disabled}
      >
        <div className="btn-left-content">
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
              const isActive = opt.value === currentValue;
              return (
                <div 
                  key={opt.value}
                  className={`dropdown-item ${isActive ? 'active' : ''}`} 
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
});

CustomDropdown.displayName = 'CustomDropdown';