import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export interface BackButtonProps {
  to?: string;
  onClick?: () => void;
  className?: string;
  title?: string;
  variant?: 'fixed' | 'inline';
}

/**
 * Universal, accessible BackButton adhering to HCI principles & WCAG AAA contrast standards.
 * Dynamically responds to Light and Dark modes using semantic design tokens.
 */
export const BackButton: React.FC<BackButtonProps> = ({
  to,
  onClick,
  className = '',
  title = 'Go back',
  variant = 'inline',
}) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  const positionClasses =
    variant === 'fixed'
      ? 'fixed top-4 left-4 sm:top-6 sm:left-6 z-[100]'
      : 'relative';

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={title}
      title={title}
      className={`group ${positionClasses} inline-flex items-center justify-center w-10 h-10 p-0 bg-surface-glass hover:bg-surface-hover active:scale-95 backdrop-blur-md border border-border-medium hover:border-border-strong text-text-primary rounded-full transition-all cursor-pointer shadow-elevation-1 hover:shadow-elevation-2 focus:outline-none focus:ring-2 focus:ring-focus-ring ${className}`}
    >
      <ArrowLeft className="w-5 h-5 text-text-primary transition-transform duration-200 group-hover:-translate-x-0.5 shrink-0" />
    </button>
  );
};
