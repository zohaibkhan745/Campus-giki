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
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full bg-[#141416] border border-[#2e2e33] rounded-lg px-4 py-2.5 flex items-center justify-between text-[#ffffff] cursor-pointer text-[15px] outline-none transition-colors hover:border-[#4a4a52] ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${icon ? 'pl-[38px]' : ''}`}
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
        <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-[#141416] border border-[#2a2a2e] rounded-lg hidden sm:block max-h-[320px] overflow-y-auto overflow-x-hidden z-[1000] shadow-[0_10px_25px_rgba(0,0,0,0.5)] !block scrollbar-thin scrollbar-thumb-[#2e2e33] scrollbar-track-transparent">
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
                  className="flex items-center justify-between px-4 py-2.5 text-[#e1e1e6] cursor-pointer text-[15px] transition-colors hover:bg-[#1f1f23]"
                >
                  <div className="flex items-center gap-3.5">
                    <span className={isActive ? "text-[#3b82f6] font-normal" : "font-normal"}>{option.label}</span>
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
