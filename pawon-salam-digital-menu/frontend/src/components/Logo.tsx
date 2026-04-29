import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'light' | 'dark' | 'color'; // light=white, dark=black, color=accent
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  variant = 'light',
  showText = true
}) => {

  // 1. Size Configuration
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    '2xl': 'w-32 h-32',
  };

  // 2. Text Size Configuration
  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
    '2xl': 'text-4xl',
  };

  // 3. Color Configuration
  const getColorClass = () => {
    switch (variant) {
      case 'light': return 'text-white';
      case 'dark': return 'text-pawon-dark';
      case 'color': return 'text-pawon-accent'; // Adapted to app theme
      default: return 'text-white';
    }
  };

  const colorClass = getColorClass();
  const subTextColorClass = variant === 'light' ? 'text-white/80' : 'text-pawon-accent/80';

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>

      {/* --- ICON PART (SVG VECTOR) --- */}
      <div className={`${sizeClasses[size]} ${colorClass} drop-shadow-sm relative flex items-center justify-center transition-transform hover:scale-105 duration-300`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
        >
          {/* Outer Circle */}
          <circle cx="50" cy="50" r="44" />

          {/* Leaf Diagonal */}
          <path d="M28 72 Q 28 28 72 28 Q 72 72 28 72 Z" />

          {/* Leaf Midrib */}
          <line x1="28" y1="72" x2="72" y2="28" />

          {/* Leaf Stem */}
          <line x1="28" y1="72" x2="19" y2="81" />
        </svg>
      </div>

      {/* --- TEXT PART (OPTIONAL) --- */}
      {showText && (
        <div className={`text-center mt-2 ${colorClass}`}>
          <h1
            className={`font-bold tracking-tight drop-shadow-sm ${textSizeClasses[size]}`}
            style={{ fontFamily: '"Playfair Display", "Times New Roman", serif' }}
          >
            Pawon Salam
          </h1>
          {size !== 'xs' && size !== 'sm' && (
            <p className={`text-[10px] tracking-widest uppercase font-medium ${subTextColorClass}`}>
              Resto & Catering
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;