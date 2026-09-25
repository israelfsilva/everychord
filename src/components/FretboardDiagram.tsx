import React from 'react';
import type { ChordVoicing } from '../core/types';
import { cn } from '@/lib/utils';
import { DifficultyPill } from './StatusPill';

export interface FretboardDiagramProps {
  voicing: ChordVoicing;
  isLeftHanded?: boolean;
  activeStringIndex?: number | null;
  isSelected?: boolean;
  width?: number;
  height?: number;
  /** Rendered size relative to the drawing geometry (scales the whole SVG) */
  displayScale?: number;
  onNoteClick?: (note: string) => void;
  onStrum?: (voicing: ChordVoicing) => void;
  className?: string;
}

export const FretboardDiagram: React.FC<FretboardDiagramProps> = ({
  voicing,
  isLeftHanded = false,
  activeStringIndex = null,
  isSelected = false,
  width = 180,
  height = 220,
  displayScale = 1,
  onNoteClick,
  onStrum,
  className = '',
}) => {
  const numStrings = voicing.frets.length;
  const numFrets = 5;
  const startFret = voicing.baseFret > 1 ? voicing.baseFret : 1;

  // Geometry
  const marginTop = 38;
  const marginBottom = 24;
  const marginLeft = 36;
  const marginRight = 18;

  const gridWidth = width - marginLeft - marginRight;
  const gridHeight = height - marginTop - marginBottom;

  const stringSpacing = gridWidth / (numStrings - 1);
  const fretSpacing = gridHeight / numFrets;

  // Returns X coordinate for a given 0-indexed string index
  const getStringX = (s: number): number => {
    if (isLeftHanded) {
      return marginLeft + (numStrings - 1 - s) * stringSpacing;
    }
    return marginLeft + s * stringSpacing;
  };

  // Returns Y coordinate for center of a fret
  const getFretCenterY = (fretNumber: number): number => {
    const fOffset = fretNumber - startFret + 1;
    return marginTop + (fOffset - 0.5) * fretSpacing;
  };

  const handleDiagramClick = () => {
    onStrum?.(voicing);
  };

  return (
    <div
      onClick={handleDiagramClick}
      className={cn(
        'group/diagram relative flex cursor-pointer select-none flex-col rounded-md surface-well p-1 transition-colors duration-200',
        isSelected && 'border-primary/50!',
        className
      )}
      data-testid="chord-diagram-card"
    >
      {/* Raised panel holding the diagram; footer sits on the recessed shell */}
      <div
        className={cn(
          'rounded-sm surface-raised p-2 transition-colors duration-200',
          isSelected ? 'border-primary!' : 'group-hover/diagram:border-muted-foreground/30!'
        )}
      >
        <svg
          width={width * displayScale}
          height={height * displayScale}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`Diagrama de acorde ${voicing.rootNote} tablatura ${voicing.tabString}`}
          className="mx-auto overflow-visible font-mono"
        >
          {/* Definitions for Glow Filter */}
          <defs>
            <filter id="string-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Base Fret Indicator (if > 1) */}
          {startFret > 1 && (
            <text
              x={marginLeft - 8}
              y={marginTop + fretSpacing / 2 + 5}
              textAnchor="end"
              fontSize="12"
              fontWeight="bold"
              className="fill-muted-foreground"
              data-testid="base-fret-label"
            >
              {startFret}fr
            </text>
          )}

          {/* Fretboard Background Grid */}
          {/* Horizontal Fret Lines */}
          {Array.from({ length: numFrets + 1 }).map((_, f) => {
            const y = marginTop + f * fretSpacing;
            const isNut = f === 0 && startFret === 1;

            return (
              <line
                key={`fret-${f}`}
                x1={marginLeft}
                y1={y}
                x2={marginLeft + gridWidth}
                y2={y}
                className={isNut ? 'stroke-foreground' : 'stroke-muted-foreground/35'}
                strokeWidth={isNut ? 5 : 1.5}
                strokeLinecap="round"
              />
            );
          })}

          {/* Vertical String Lines */}
          {Array.from({ length: numStrings }).map((_, s) => {
            const x = getStringX(s);
            const isActive = activeStringIndex === s;
            // String thickness: String 0 is thicker (2.4px down to 1.0px)
            const baseStrokeWidth = 2.4 - (s / (numStrings - 1)) * 1.4;

            return (
              <g key={`string-group-${s}`}>
                {/* String line */}
                <line
                  data-string-index={s}
                  data-active={isActive ? 'true' : 'false'}
                  x1={x}
                  y1={marginTop}
                  x2={x}
                  y2={marginTop + gridHeight}
                  strokeWidth={isActive ? baseStrokeWidth + 2 : baseStrokeWidth}
                  filter={isActive ? 'url(#string-glow)' : undefined}
                  className={isActive ? 'stroke-primary-text animate-pulse transition-all' : 'stroke-muted-foreground'}
                />
              </g>
            );
          })}

          {/* Top Markers (O / X above Nut) */}
          {voicing.frets.map((fret, s) => {
            const x = getStringX(s);
            const y = marginTop - 16;
            const marker = voicing.markers?.[s];

            if (fret === -1) {
              // Muted string (X)
              return (
                <text
                  key={`marker-${s}`}
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="bold"
                  data-testid="marker-mute"
                  className="fill-muted-foreground select-none"
                >
                  ✕
                </text>
              );
            }

            if (fret === 0) {
              // Open string (O)
              const isActive = activeStringIndex === s;
              return (
                <circle
                  key={`marker-${s}`}
                  cx={x}
                  cy={y}
                  r={5.5}
                  fill="none"
                  strokeWidth="1.8"
                  data-testid="marker-open"
                  className={cn(
                    'cursor-pointer',
                    isActive ? 'stroke-primary-text' : 'stroke-foreground'
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (marker?.note) onNoteClick?.(marker.note);
                  }}
                />
              );
            }

            return null;
          })}

          {/* Barre Chords Visual Pill */}
          {voicing.barres.map((barre, bIdx) => {
            const y = getFretCenterY(barre.fret);
            const x1 = getStringX(barre.fromString);
            const x2 = getStringX(barre.toString);
            const minX = Math.min(x1, x2);
            const maxX = Math.max(x1, x2);
            const pillWidth = maxX - minX + 20;

            return (
              <rect
                key={`barre-${bIdx}`}
                x={minX - 10}
                y={y - 10}
                width={pillWidth}
                height={20}
                rx={10}
                data-testid="barre-pill"
                className="fill-primary transition-all"
              />
            );
          })}

          {/* Fretted Dots and Finger Numbers */}
          {voicing.frets.map((fret, s) => {
            if (fret <= 0) return null;

            const cx = getStringX(s);
            const cy = getFretCenterY(fret);
            const finger = voicing.fingers[s];
            const marker = voicing.markers?.[s];
            const isBarreString = voicing.barres.some(
              (b) => b.fret === fret && s >= b.fromString && s <= b.toString
            );
            const isActive = activeStringIndex === s;

            return (
              <g
                key={`dot-${s}`}
                data-testid={`fret-dot-${finger ?? s}`}
                className="cursor-pointer hover:fill-primary-text"
                onClick={(e) => {
                  e.stopPropagation();
                  if (marker?.note) onNoteClick?.(marker.note);
                }}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={10}
                  strokeWidth="1.8"
                  className={
                    isActive
                      ? 'fill-primary-text stroke-foreground'
                      : isBarreString
                      ? 'fill-primary stroke-primary'
                      : 'fill-primary stroke-card'
                  }
                  filter={isActive ? 'url(#string-glow)' : undefined}
                />
                {finger && (
                  <text
                    x={cx}
                    y={cy + 3.5}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="bold"
                    className="fill-primary-foreground pointer-events-none select-none"
                  >
                    {finger}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Card Footer: Tab notation and difficulty */}
      <div className="flex items-center justify-between px-2.5 pb-1.5 pt-2">
        <span className="font-mono text-xs font-semibold tracking-[0.12em] text-foreground">
          {voicing.tabString}
        </span>
        <DifficultyPill score={voicing.difficultyScore} />
      </div>
    </div>
  );
};
