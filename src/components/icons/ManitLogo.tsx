import React from 'react';

interface ManitLogoProps {
  className?: string;
}

/**
 * COMPONENT: ManitLogo
 * PURPOSE: Minimal abstract logo for Manit AI - distinctive M shape with AI flow
 * FLOW: Renders SVG with customizable className
 * DEPENDENCIES: None
 */
export const ManitLogo: React.FC<ManitLogoProps> = ({ className = "w-8 h-8" }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Gradient definitions */}
      <defs>
        <linearGradient id="manit-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" /> {/* orange-500 */}
          <stop offset="50%" stopColor="#fb923c" /> {/* orange-400 */}
          <stop offset="100%" stopColor="#f59e0b" /> {/* amber-500 */}
        </linearGradient>
        <linearGradient id="manit-gradient-light" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      
      {/* Abstract M shape - bold and distinctive */}
      <g>
        {/* Main M structure - filled for better visibility at small sizes */}
        <path
          d="M3 20V8C3 7.44772 3.44772 7 4 7C4.37885 7 4.725 7.214 4.89443 7.55279L8 14L11.1056 7.55279C11.275 7.214 11.6212 7 12 7C12.3788 7 12.725 7.214 12.8944 7.55279L16 14L19.1056 7.55279C19.275 7.214 19.6212 7 20 7C20.5523 7 21 7.44772 21 8V20C21 20.5523 20.5523 21 20 21C19.4477 21 19 20.5523 19 20V13L16.8944 17.4472C16.725 17.786 16.3788 18 16 18C15.6212 18 15.275 17.786 15.1056 17.4472L12 11L8.89443 17.4472C8.725 17.786 8.37885 18 8 18C7.62115 18 7.275 17.786 7.10557 17.4472L5 13V20C5 20.5523 4.55228 21 4 21C3.44772 21 3 20.5523 3 20Z"
          fill="url(#manit-gradient)"
        />
        
        {/* AI flow dots - positioned at peaks */}
        <circle cx="4" cy="4" r="1.5" fill="url(#manit-gradient)" />
        <circle cx="12" cy="4" r="1.5" fill="url(#manit-gradient)" />
        <circle cx="20" cy="4" r="1.5" fill="url(#manit-gradient)" />
        
        {/* Connecting flow - subtle lines */}
        <path
          d="M5.5 4h5M13.5 4h5"
          stroke="url(#manit-gradient)"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.4"
        />
      </g>
    </svg>
  );
};