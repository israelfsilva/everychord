import React from 'react';
import { cn } from '@/lib/utils';

export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral';

const TONE_CLASSES: Record<StatusTone, { chip: string; dot: string }> = {
  success: { chip: 'text-easy bg-easy-bg', dot: 'bg-easy' },
  warning: { chip: 'text-warn bg-warn-bg', dot: 'bg-warn' },
  danger: { chip: 'text-hard bg-hard-bg', dot: 'bg-hard' },
  neutral: { chip: 'text-muted bg-raised', dot: 'bg-muted' },
};

interface StatusPillProps {
  tone: StatusTone;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

/** Soft status chip with a colored dot (e.g. "Fácil"). */
export const StatusPill: React.FC<StatusPillProps> = ({ tone, children, title, className }) => (
  <span
    title={title}
    className={cn(
      'inline-flex items-center gap-[5px] rounded-chip px-2 py-[3px] text-[11px] leading-none whitespace-nowrap',
      TONE_CLASSES[tone].chip,
      className
    )}
  >
    <span className={cn('h-[5px] w-[5px] shrink-0 rounded-full', TONE_CLASSES[tone].dot)} />
    {children}
  </span>
);

function getDifficulty(score: number): { label: string; tone: StatusTone } {
  if (score <= 15) return { label: 'Fácil', tone: 'success' };
  if (score <= 25) return { label: 'Média', tone: 'warning' };
  return { label: 'Difícil', tone: 'danger' };
}

export const DifficultyPill: React.FC<{ score: number; className?: string }> = ({
  score,
  className,
}) => {
  const { label, tone } = getDifficulty(score);
  return (
    <StatusPill tone={tone} title={`Score de dificuldade: ${score}`} className={className}>
      {label}
    </StatusPill>
  );
};
