import React from 'react';
import { cn } from '@/lib/utils';

export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral';

const TONE_CLASSES: Record<StatusTone, { text: string; dot: string }> = {
  success: { text: 'text-success', dot: 'bg-success' },
  warning: { text: 'text-warning', dot: 'bg-warning' },
  danger: { text: 'text-destructive', dot: 'bg-destructive' },
  neutral: { text: 'text-muted-foreground', dot: 'bg-muted-foreground' },
};

interface StatusPillProps {
  tone: StatusTone;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

/** Rounded status badge with a colored dot, like the reference's Success / Pending / Refunded. */
export const StatusPill: React.FC<StatusPillProps> = ({ tone, children, title, className }) => (
  <span
    title={title}
    className={cn(
      'inline-flex items-center gap-1.5 rounded-sm border border-border bg-muted px-2 py-0.5 text-[11px] font-medium whitespace-nowrap',
      TONE_CLASSES[tone].text,
      className
    )}
  >
    <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', TONE_CLASSES[tone].dot)} />
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
