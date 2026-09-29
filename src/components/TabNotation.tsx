import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Tablature with one fixed-width cell per string, so frets >= 10 ("X(15)(14)…")
 * keep a bounded width instead of overflowing the card.
 * Single-digit voicings keep the compact letter-spaced look ("X32010").
 */
export const TabNotation: React.FC<{
  frets: number[];
  size?: 'sm' | 'lg';
  className?: string;
}> = ({ frets, size = 'sm', className }) => {
  const label = frets.map((f) => (f === -1 ? 'X' : f)).join(' ');
  const hasTwoDigits = frets.some((f) => f >= 10);

  if (!hasTwoDigits) {
    return (
      <span
        aria-label={`Tablatura ${label}`}
        className={cn(
          'font-mono font-medium whitespace-nowrap text-text',
          size === 'lg' ? 'text-[22px] tracking-[0.14em]' : 'text-[13px] tracking-[0.16em]',
          className
        )}
      >
        {frets.map((f) => (f === -1 ? 'X' : f)).join('')}
      </span>
    );
  }

  return (
    <span
      aria-label={`Tablatura ${label}`}
      className={cn(
        'flex font-mono font-medium whitespace-nowrap text-text',
        size === 'lg' ? 'gap-1 text-[18px]' : 'gap-px text-[12px]',
        className
      )}
    >
      {frets.map((f, s) => (
        <span key={s} aria-hidden className="w-[2ch] text-center">
          {f === -1 ? 'X' : f}
        </span>
      ))}
    </span>
  );
};
