import React from 'react';
import { cn } from '@/lib/utils';

/** Section header: mono label on the left, current value (accent) or meta on the right. */
export const SectionTitle: React.FC<{
  label: string;
  value?: React.ReactNode;
  className?: string;
}> = ({ label, value, className }) => (
  <div className={cn('flex items-center justify-between gap-3', className)}>
    <h2 className="eyebrow">{label}</h2>
    {value !== undefined && (
      <span className="truncate font-mono text-[10px] tracking-[0.18em] text-accent">{value}</span>
    )}
  </div>
);
