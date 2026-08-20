import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

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
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({ options, value, onChange, placeholder = "Select option", className }) => {
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
    <div className="relative w-[220px]" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={className || "w-full bg-[#141416] border border-[#2e2e33] rounded-lg px-4 py-2.5 flex items-center justify-between text-white cursor-pointer text-[15px] outline-none transition-colors hover:border-[#4a4a52]"}
      >
        <span className="font-medium text-white">{selectedOption.label}</span>
        <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-[#111113]/90 backdrop-blur-[24px] border border-white/10 rounded-[18px] max-h-[320px] overflow-y-auto z-[1000] shadow-[0_12px_40px_rgba(0,0,0,0.6)] scrollbar-thin scrollbar-thumb-white/20 hover:scrollbar-thumb-white/40">
          <div className="py-2">
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between px-5 py-3 cursor-pointer text-[15px] transition-colors hover:bg-white/10 ${value === option.value ? 'bg-white/10 text-white font-semibold' : 'text-gray-300 font-medium'}`}
              >
                <span>{option.label}</span>
                {value === option.value && <Check className="w-4 h-4 text-white" strokeWidth={2.5} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
