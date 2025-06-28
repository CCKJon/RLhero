import React from 'react';

interface CurrencyIconProps {
  type: 'gold' | 'sp';
  size?: number;
  className?: string;
}

export default function CurrencyIcon({ type, size = 20, className = '' }: CurrencyIconProps) {
  const getImageSrc = () => {
    switch (type) {
      case 'gold':
        return '/images/fire-emblem/gold-coin.png';
      case 'sp':
        return '/images/fire-emblem/sp-coin.png';
      default:
        return '/images/fire-emblem/gold-coin.png';
    }
  };

  const getAltText = () => {
    switch (type) {
      case 'gold':
        return 'Gold';
      case 'sp':
        return 'SP';
      default:
        return 'Currency';
    }
  };

  return (
    <img
      src={getImageSrc()}
      alt={getAltText()}
      width={size}
      height={size}
      className={className}
      loading="lazy"
      onError={(e) => {
        // Fallback to a simple colored circle if image fails to load
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        const fallback = document.createElement('div');
        fallback.style.width = `${size}px`;
        fallback.style.height = `${size}px`;
        fallback.style.borderRadius = '50%';
        fallback.style.backgroundColor = type === 'gold' ? '#fbbf24' : '#a855f7';
        fallback.style.display = 'inline-block';
        fallback.style.marginRight = '4px';
        target.parentNode?.insertBefore(fallback, target);
      }}
    />
  );
} 