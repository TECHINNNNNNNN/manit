import React from 'react';

interface ManitLogoProps {
  className?: string;
}

/**
 * COMPONENT: ManitLogo
 * PURPOSE: Custom SVG logo for Manit AI - minimal design representing AI-powered link creation
 * FLOW: Renders SVG with customizable className
 * DEPENDENCIES: None
 */
export const ManitLogo: React.FC<ManitLogoProps> = ({ className = "w-8 h-8" }) => {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Gradient definitions */}
      <defs>
        <linearGradient id="manit-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" /> {/* orange-500 */}
          <stop offset="100%" stopColor="#f59e0b" /> {/* amber-500 */}
        </linearGradient>
      </defs>
      
      {/* Minimalist M shape with AI nodes */}
      <g>
        {/* Main M shape - representing Manit */}
        <path
          d="M6 26V12L11 20L16 12L21 20L26 12V26"
          stroke="url(#manit-gradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* AI nodes - representing connection points */}
        <circle cx="6" cy="8" r="2" fill="url(#manit-gradient)" />
        <circle cx="16" cy="8" r="2" fill="url(#manit-gradient)" />
        <circle cx="26" cy="8" r="2" fill="url(#manit-gradient)" />
        
        {/* Connecting lines - representing links */}
        <path
          d="M8 8h6M18 8h6"
          stroke="url(#manit-gradient)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.6"
        />
      </g>
    </svg>
  );
};