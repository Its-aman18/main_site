import React, { useState } from 'react';

interface CodeScrietLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const CodeScrietLogo: React.FC<CodeScrietLogoProps> = ({
  className = '',
  size = 36,
  showText = true,
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Official circular seal emblem */}
      <div
        style={{ width: size, height: size }}
        className="relative flex-shrink-0 flex items-center justify-center rounded-full overflow-hidden shadow-sm"
      >
        {!imageError ? (
          <img
            src="/logo.png"
            alt="Code.SCRIET Emblem"
            width={size}
            height={size}
            onError={() => setImageError(true)}
            className="w-full h-full object-contain select-none"
            loading="eager"
            draggable={false}
          />
        ) : (
          <div
            style={{ width: size, height: size }}
            className="w-full h-full rounded-full bg-gradient-to-br from-[#DE7923] to-[#F7BA3E] flex items-center justify-center text-white font-mono font-bold text-xs"
          >
            {'{ }'}
          </div>
        )}
      </div>

      {showText && (
        <span
          className="font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center select-none"
          style={{ fontSize: Math.max(14, Math.round(size * 0.52)) }}
        >
          <span>code</span>
          <span className="text-orange-500">.</span>
          <span>scriet</span>
        </span>
      )}
    </div>
  );
};

