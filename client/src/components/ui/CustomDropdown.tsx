import React, { useState, useRef, useEffect } from 'react';

interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select...", 
  className = "w-full",
  disabled = false,
  icon
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value) || { value: '', label: placeholder };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef} style={{ zIndex: isOpen ? 9999 : 'auto' }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full bg-white/[0.08] backdrop-blur-[20px] border border-white/20 rounded-xl px-4 py-2.5 flex items-center justify-between text-white cursor-pointer text-sm outline-none transition-all hover:border-white/40 hover:bg-white/[0.12] ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${icon ? 'pl-[38px]' : ''}`}
      >
        {icon && (
          <div className="absolute left-3 text-gray-400 pointer-events-none flex items-center justify-center z-10">
            {icon}
          </div>
        )}
        <div className="flex items-center gap-3 w-full">
          <span className="font-normal text-white truncate">{selectedOption.label}</span>
        </div>
        <svg 
          className={`w-4 h-4 shrink-0 stroke-white stroke-2 fill-none transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          viewBox="0 0 24 24"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-[#0d0e10]/90 backdrop-blur-[24px] border border-white/20 rounded-xl max-h-[320px] overflow-y-auto overflow-x-hidden z-[9999] shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
          <div className="py-1.5">
            {options.map((option) => {
              const isActive = option.value === value;
              return (
                <div
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className="flex items-center justify-between px-4 py-2.5 text-white/80 cursor-pointer text-sm transition-colors hover:bg-white/10"
                >
                  <div className="flex items-center gap-3.5">
                    <span className={isActive ? "text-[#3b82f6] font-semibold" : "font-normal"}>{option.label}</span>
                  </div>
                  {isActive && (
                    <svg className="w-4 h-4 stroke-[#3b82f6] stroke-[2.5px] fill-none shrink-0" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
