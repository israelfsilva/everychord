import React from 'react';
import type { ChordVoicing } from '../core/types';
import { cn } from '@/lib/utils';
import { DifficultyPill } from './StatusPill';
import { TabNotation } from './TabNotation';
import { MUTE_STROKE, mutePath } from '@/lib/mute-mark';

export interface FretboardDiagramProps {
  voicing: ChordVoicing;
  /** 1-based position shown as "#n" in the corner */
  index?: number;
  isLeftHanded?: boolean;
  activeStringIndex?: number | null;
  isSelected?: boolean;
  onNoteClick?: (note: string) => void;
  onStrum?: (voicing: ChordVoicing) => void;
  className?: string;
}

// Drawing geometry (px): 20px between strings, 25px between frets, 5 frets shown
const STRING_GAP = 20;
const FRET_GAP = 25;
const NUM_FRETS = 5;
const VIEW_W = 164;
const VIEW_H = 184;
const GRID_TOP = 40;
// The grid sits 6px right of center to leave room for the "3fr" label
const GRID_CENTER_X = VIEW_W / 2 + 6;

export const FretboardDiagram: React.FC<FretboardDiagramProps> = ({
  voicing,
  index,
  isLeftHanded = false,
  activeStringIndex = null,
  isSelected = false,
  onNoteClick,
  onStrum,
  className = '',
}) => {
  const numStrings = voicing.frets.length;
  const startFret = voicing.baseFret > 1 ? voicing.baseFret : 1;

  const gridWidth = (numStrings - 1) * STRING_GAP;
  const gridHeight = NUM_FRETS * FRET_GAP;
  const gridLeft = GRID_CENTER_X - 50;
  const x0 = gridLeft + (100 - gridWidth) / 2;

  const getStringX = (s: number): number =>
    x0 + (isLeftHanded ? numStrings - 1 - s : s) * STRING_GAP;

  const getFretCenterY = (fretNumber: number): number =>
    GRID_TOP + (fretNumber - startFret + 0.5) * FRET_GAP;

  const strum = () => onStrum?.(voicing);

  const playMarker = (e: React.MouseEvent, s: number) => {
    e.stopPropagation();
    const note = voicing.markers?.[s]?.note;
    if (note) onNoteClick?.(note);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onClick={strum}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          strum();
        }
      }}
      className={cn(
        'flex cursor-pointer select-none flex-col rounded-oc border bg-card transition-[border-color,box-shadow] duration-120 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        isSelected
          ? 'border-accent shadow-[0_0_0_3px_var(--accent-soft)]'
          : 'border-line hover:border-muted',
        className
      )}
      data-testid="chord-diagram-card"
    >
      <div className="relative flex h-[184px] justify-center">
        {index !== undefined && (
          <span className="pointer-events-none absolute left-3 top-2.5 font-mono text-[10px] text-faint">
            #{index}
          </span>
        )}

        <svg
          width={VIEW_W}
          height={VIEW_H}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          role="img"
          aria-label={`Diagrama de acorde ${voicing.rootNote} tablatura ${voicing.tabString}`}
          className="overflow-visible font-mono"
        >
          {startFret > 1 && (
            <text
              x={x0 - 10}
              y={GRID_TOP + FRET_GAP / 2 + 3.5}
              textAnchor="end"
              fontSize="10"
              className="fill-muted"
              data-testid="base-fret-label"
            >
              {startFret}fr
            </text>
          )}

          {/* Fret lines */}
          {Array.from({ length: NUM_FRETS + 1 }).map((_, f) => {
            const y = GRID_TOP + f * FRET_GAP;
            return (
              <line
                key={`fret-${f}`}
                x1={x0}
                y1={y + 0.5}
                x2={x0 + gridWidth + 1}
                y2={y + 0.5}
                strokeWidth={1}
                className="stroke-fret"
              />
            );
          })}

          {/* Strings */}
          {Array.from({ length: numStrings }).map((_, s) => {
            const x = getStringX(s) + 0.5;
            const isActive = activeStringIndex === s;
            return (
              <line
                key={`string-${s}`}
                data-string-index={s}
                data-active={isActive ? 'true' : 'false'}
                x1={x}
                y1={GRID_TOP}
                x2={x}
                y2={GRID_TOP + gridHeight}
                strokeWidth={isActive ? 2 : 1}
                className={isActive ? 'stroke-accent' : 'stroke-fret'}
              />
            );
          })}

          {/* Nut (open position) */}
          {startFret === 1 && (
            <rect
              x={x0 - 1}
              y={GRID_TOP - 2}
              width={gridWidth + 3}
              height={4}
              rx={1}
              className="fill-text"
              data-testid="nut"
            />
          )}

          {/* Open / muted markers above the nut */}
          {voicing.frets.map((fret, s) => {
            const x = getStringX(s) + 0.5;
            // × and ○ share the same center so they line up regardless of font metrics
            const y = GRID_TOP - 15.5;
            if (fret === -1) {
              return (
                <path
                  key={`marker-${s}`}
                  d={mutePath(x, y)}
                  strokeWidth={MUTE_STROKE}
                  strokeLinecap="round"
                  data-testid="marker-mute"
                  data-cx={x}
                  className="stroke-muted"
                />
              );
            }
            if (fret === 0) {
              const isActive = activeStringIndex === s;
              return (
                <circle
                  key={`marker-${s}`}
                  cx={x}
                  cy={y}
                  r={3.75}
                  fill="transparent"
                  strokeWidth="1.5"
                  data-testid="marker-open"
                  className={cn('cursor-pointer', isActive ? 'stroke-accent' : 'stroke-text')}
                  onClick={(e) => playMarker(e, s)}
                />
              );
            }
            return null;
          })}

          {/* Barres */}
          {voicing.barres.map((barre, bIdx) => {
            const y = getFretCenterY(barre.fret);
            const xa = getStringX(barre.fromString);
            const xb = getStringX(barre.toString);
            const minX = Math.min(xa, xb);
            return (
              <rect
                key={`barre-${bIdx}`}
                x={minX - 7}
                y={y - 7.5}
                width={Math.abs(xb - xa) + 15}
                height={15}
                rx={7.5}
                data-testid="barre-pill"
                className="fill-accent"
              />
            );
          })}

          {/* Fretted dots with finger numbers */}
          {voicing.frets.map((fret, s) => {
            if (fret <= 0) return null;
            const cx = getStringX(s) + 0.5;
            const cy = getFretCenterY(fret);
            const finger = voicing.fingers[s];
            const isActive = activeStringIndex === s;

            return (
              <g
                key={`dot-${s}`}
                data-testid={`fret-dot-${finger ?? s}`}
                className="cursor-pointer"
                onClick={(e) => playMarker(e, s)}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={7.5}
                  className={cn('fill-accent', isActive && 'stroke-accent-soft')}
                  strokeWidth={isActive ? 6 : 0}
                />
                {finger && (
                  <text
                    x={cx}
                    y={cy + 2.8}
                    textAnchor="middle"
                    fontSize="8"
                    fontWeight="700"
                    className="pointer-events-none fill-on-accent"
                  >
                    {finger}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-line-soft px-3 py-2.5">
        <TabNotation frets={voicing.frets} className="min-w-0" />
        <DifficultyPill score={voicing.difficultyScore} className="shrink-0" />
      </div>
    </div>
  );
};
