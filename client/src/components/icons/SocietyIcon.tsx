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
    {/* Center person */}
    <path d="M16 21v-2a4 4 0 0 0-4-4H12a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
    {/* Left person */}
    <path d="M4.5 20v-1a3 3 0 0 1 3-3" />
    <path d="M5.5 10a3 3 0 0 1 0-5.5" />
    {/* Right person */}
    <path d="M19.5 20v-1a3 3 0 0 0-3-3" />
    <path d="M18.5 4.5a3 3 0 0 1 0 5.5" />
  </svg>
);
