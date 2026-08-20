import React, { useState, useRef, useEffect } from 'react';

interface DropdownOption {
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
  variant?: 'default' | 'ghost'; // Added variant
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select...", 
  className = "w-full",
  disabled = false,
  icon,
  variant = 'default'
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

  const buttonClasses = variant === 'ghost'
    ? `w-full bg-transparent border-none px-2 py-2 flex items-center justify-between text-white cursor-pointer text-[15px] outline-none transition-colors hover:text-gray-300 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${icon ? 'pl-[34px]' : ''}`
    : `w-full bg-[rgba(255,255,255,0.08)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] rounded-[18px] px-4 py-2.5 flex items-center justify-between text-white cursor-pointer text-[15px] outline-none transition-colors hover:border-[#4a4a52] hover:bg-white/[0.12] ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${icon ? 'pl-[38px]' : ''}`;

  return (
    <div className={`relative ${className}`} ref={containerRef} style={{ zIndex: isOpen ? 9999 : 'auto' }}>
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          if (!disabled) {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }
        }}
        className={buttonClasses}
      >
        {icon && (
          <div className="absolute left-2 text-gray-400 pointer-events-none flex items-center justify-center z-10">
            {icon}
          </div>
        )}
        <div className="flex items-center gap-2 w-full">
          {selectedOption.code && (
             <span className="text-[#9e9ea7] text-[13px] font-medium min-w-[22px]">{selectedOption.code}</span>
          )}
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
        <div className="absolute top-[calc(100%+6px)] right-0 min-w-full w-max bg-[rgba(20,20,22,0.85)] backdrop-blur-[20px] border border-[#2a2a2e] rounded-[18px] block max-h-[320px] overflow-y-auto overflow-x-hidden z-[9999] shadow-[0_10px_25px_rgba(0,0,0,0.5)] scrollbar-thin scrollbar-thumb-[#2e2e33] scrollbar-track-transparent">
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
                  className={`flex items-center justify-between px-4 py-2.5 cursor-pointer text-[15px] transition-colors hover:bg-white/10 ${isActive ? 'active' : ''}`}
                >
                  <div className="flex items-center gap-3.5">
                    {option.code && (
                       <span className={`text-[13px] font-medium min-w-[22px] ${isActive ? 'text-[#3b82f6]' : 'text-[#9e9ea7]'}`}>{option.code}</span>
                    )}
                    <span className={`font-normal ${isActive ? 'text-[#3b82f6]' : 'text-[#e1e1e6]'}`}>{option.label}</span>
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
