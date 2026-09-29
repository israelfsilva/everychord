import React from 'react';
import { MUTE_HALF, MUTE_STROKE, mutePath } from '@/lib/mute-mark';

/** Muted-string × for HTML layouts (e.g. the neck panel); centers exactly, independent of font metrics. */
export const MuteMark: React.FC<{ className?: string; style?: React.CSSProperties }> = ({
  className,
  style,
}) => (
  <svg
    width={MUTE_HALF * 2}
    height={MUTE_HALF * 2}
    viewBox={`0 0 ${MUTE_HALF * 2} ${MUTE_HALF * 2}`}
    aria-hidden
    className={className}
    style={style}
    overflow="visible"
  >
    <path
      d={mutePath(MUTE_HALF, MUTE_HALF)}
      strokeWidth={MUTE_STROKE}
      strokeLinecap="round"
      className="stroke-muted"
      fill="none"
    />
  </svg>
);
