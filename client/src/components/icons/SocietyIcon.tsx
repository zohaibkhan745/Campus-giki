import React from 'react';

export const SocietyIcon = ({ className = "w-5 h-5", style, ...props }: { className?: string, style?: React.CSSProperties, strokeWidth?: number | string, [key: string]: any }) => (
  <img src="https://img.icons8.com/pastel-glyph/64/afabab/groups--v1.png" className={className} style={{...style, objectFit: 'contain'}} alt="Society Icon" {...props} />
);
