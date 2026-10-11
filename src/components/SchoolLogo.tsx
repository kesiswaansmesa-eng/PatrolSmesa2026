import React, { useState } from 'react';

interface SchoolLogoProps {
  className?: string;
  size?: number;
  src?: string;
  alt?: string;
}

export const OFFICIAL_SMKN1_LOGO_URL = 'https://iili.io/nMvNPFs.md.png';

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  className = '',
  size = 40,
  src,
  alt = 'Logo SMK Negeri 1 Jember',
}) => {
  const [imageError, setImageError] = useState(false);
  const logoSource = src || OFFICIAL_SMKN1_LOGO_URL;

  if (imageError) {
    // Elegant SVG fallback if network or image fails
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 ${className}`}
        aria-label={alt}
      >
        <path
          d="M50 4L88 18V48C88 72 50 94 50 94C50 94 12 72 12 48V18L50 4Z"
          fill="#1E3A8A"
          stroke="#D97706"
          strokeWidth="3.5"
        />
        <circle cx="50" cy="46" r="18" stroke="#F59E0B" strokeWidth="2.5" strokeDasharray="6 3" />
        <path
          d="M32 60C39 57 46 59 50 62C54 59 61 57 68 60V73C61 70 54 72 50 75C46 72 39 70 32 73V60Z"
          fill="#FFFFFF"
          stroke="#1E3A8A"
          strokeWidth="1.5"
        />
        <text
          x="50"
          y="85.5"
          textAnchor="middle"
          fontSize="7"
          fontWeight="bold"
          fill="#FFFFFF"
          fontFamily="sans-serif"
        >
          SMKN 1 JEMBER
        </text>
      </svg>
    );
  }

  return (
    <img
      src={logoSource}
      alt={alt}
      width={size}
      height={size}
      onError={() => setImageError(true)}
      className={`shrink-0 object-contain drop-shadow-xs select-none ${className}`}
      style={{
        width: size,
        height: size,
        maxWidth: size,
        maxHeight: size,
      }}
      loading="eager"
    />
  );
};
