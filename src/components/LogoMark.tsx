import React, { useId } from 'react';

/**
 * EveryChord mark: a tilted acoustic guitar in currentColor (sound hole and bridge are cut out).
 * Keep in sync with public/favicon.svg, which draws the same geometry on the accent tile.
 */
export const LogoMark: React.FC<{ className?: string }> = ({ className }) => {
  const maskId = useId();
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <defs>
        <mask id={maskId}>
          <rect width="24" height="24" fill="#fff" />
          <circle cx="12" cy="14.6" r="1.7" fill="#000" />
          <rect x="9.6" y="18.7" width="4.8" height="1.3" rx=".65" fill="#000" />
        </mask>
      </defs>
      <g transform="translate(1.1 -1.1) rotate(40 12 12)" fill="currentColor">
        <g mask={`url(#${maskId})`}>
          <circle cx="12" cy="11.9" r="3.9" />
          <circle cx="12" cy="17.4" r="5.1" />
        </g>
        <rect x="11.1" y="2.6" width="1.8" height="7" />
        <rect x="10.2" y="0.4" width="3.6" height="3.2" rx=".9" />
      </g>
    </svg>
  );
};
