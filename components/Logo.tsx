
import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "h-12", variant = 'dark', showText = true }) => {
  const isLight = variant === 'light';
  const primaryColor = "#C5A059"; // Gold
  const secondaryColor = isLight ? "#FFFFFF" : "#0A1F1C"; // White or Oak
  const leafColor = "#2D5A27"; // Dark Green Leaves

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* SVG Emblem */}
      <svg viewBox="0 0 100 100" className="h-full w-auto drop-shadow-sm">
        {/* Outer Gold Circle */}
        <circle cx="50" cy="45" r="42" fill="none" stroke={primaryColor} strokeWidth="2.5" />
        
        {/* Background of the emblem (only if needed, usually transparent) */}
        
        {/* Ground */}
        <path 
          d="M15 70 Q50 60 85 70" 
          fill="none" 
          stroke={primaryColor} 
          strokeWidth="3" 
          strokeLinecap="round" 
        />
        <path d="M15 70 Q50 60 85 70 L85 75 Q50 65 15 75 Z" fill={primaryColor} />

        {/* Tree Trunk & Branches */}
        <path 
          d="M50 70 L50 45 M50 65 L40 55 M50 60 L62 50 M45 50 L35 42 M55 48 L68 38 M50 45 L42 35 M50 45 L58 35" 
          fill="none" 
          stroke={primaryColor} 
          strokeWidth="2.5" 
          strokeLinecap="round" 
        />
        
        {/* Leaves (Clusters) */}
        <g fill={leafColor}>
          <circle cx="35" cy="42" r="4" />
          <circle cx="42" cy="35" r="5" />
          <circle cx="50" cy="30" r="5" />
          <circle cx="58" cy="35" r="5" />
          <circle cx="68" cy="38" r="4" />
          <circle cx="40" cy="55" r="3" />
          <circle cx="62" cy="50" r="3" />
          <circle cx="30" cy="50" r="3" />
          <circle cx="70" cy="45" r="3" />
          <circle cx="45" cy="25" r="3" />
          <circle cx="55" cy="25" r="3" />
          <circle cx="35" cy="32" r="3" />
          <circle cx="65" cy="32" r="3" />
        </g>
      </svg>

      {/* Brand Text */}
      {showText && (
        <div className="mt-2 text-center">
          <div 
            className="font-serif text-lg tracking-[0.2em] uppercase leading-none"
            style={{ color: secondaryColor }}
          >
            New Oak
          </div>
          <div 
            className="text-[8px] tracking-[0.4em] uppercase font-bold mt-1"
            style={{ color: primaryColor }}
          >
            Ltd. Company
          </div>
        </div>
      )}
    </div>
  );
};
