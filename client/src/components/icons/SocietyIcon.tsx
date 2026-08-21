import React from 'react';

export const SocietyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Left background person */}
    <path d="M7 16v-1a2 2 0 0 1 2-2h1" />
    <circle cx="8" cy="7" r="3" />
    
    {/* Right background person */}
    <path d="M17 16v-1a2 2 0 0 0-2-2h-1" />
    <circle cx="16" cy="7" r="3" />
    
    {/* Front center person */}
    <path d="M18 21v-1a3 3 0 0 0-3-3H9a3 3 0 0 0-3 3v1" />
    <circle cx="12" cy="12" r="3.5" />
  </svg>
);
