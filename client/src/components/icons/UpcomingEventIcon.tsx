import React from 'react';

export const UpcomingEventIcon = ({ className = "w-5 h-5", style, strokeWidth, ...props }: { className?: string, style?: React.CSSProperties, strokeWidth?: number | string, [key: string]: any }) => (
  <svg width="100%" height="100%" className={className} style={style} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M22 14V12C22 8.22876 22 6.34315 20.8284 5.17157C19.6569 4 17.7712 4 14 4H10C6.22876 4 4.34315 4 3.17157 5.17157C2 6.34315 2 8.22876 2 12V14C2 17.7712 2 19.6569 3.17157 20.8284C4.34315 22 6.22876 22 10 22H14" stroke="currentColor" strokeWidth={strokeWidth || "1.5"} strokeLinecap="round"/>
    <path d="M7 4V2.5" stroke="currentColor" strokeWidth={strokeWidth || "1.5"} strokeLinecap="round"/>
    <path d="M17 4V2.5" stroke="currentColor" strokeWidth={strokeWidth || "1.5"} strokeLinecap="round"/>
    <circle cx="18" cy="18" r="3" stroke="currentColor" strokeWidth={strokeWidth || "1.5"}/>
    <path d="M20.5 20.5L22 22" stroke="currentColor" strokeWidth={strokeWidth || "1.5"} strokeLinecap="round"/>
    <path d="M2.5 9H21.5" stroke="currentColor" strokeWidth={strokeWidth || "1.5"} strokeLinecap="round"/>
  </svg>
);
