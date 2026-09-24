import React from 'react';
import type { ChordVoicing } from '../core/types';

export interface FretboardDiagramProps {
  voicing: ChordVoicing;
  isLeftHanded?: boolean;
  activeStringIndex?: number | null;
  isSelected?: boolean;
  width?: number;
  height?: number;
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
      className={`relative inline-block cursor-pointer select-none rounded-xl p-2 transition-all duration-200 ${
        isSelected
          ? 'bg-neutral-900/90 ring-2 ring-cyan-500 shadow-lg shadow-cyan-500/20'
          : 'bg-neutral-950/60 hover:bg-neutral-900/80 hover:ring-1 hover:ring-neutral-700'
      } ${className}`}
      data-testid="chord-diagram-card"
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Diagrama de acorde ${voicing.rootNote} tablatura ${voicing.tabString}`}
        className="overflow-visible font-mono"
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
            fill="#a1a1aa"
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
              stroke={isNut ? '#e4e4e7' : '#3f3f46'}
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
                stroke={isActive ? '#38bdf8' : '#71717a'}
                strokeWidth={isActive ? baseStrokeWidth + 2 : baseStrokeWidth}
                filter={isActive ? 'url(#string-glow)' : undefined}
                className={isActive ? 'animate-pulse transition-all' : ''}
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
                fill="#ef4444"
                data-testid="marker-mute"
                className="select-none"
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
                stroke={isActive ? '#38bdf8' : '#e4e4e7'}
                strokeWidth="1.8"
                data-testid="marker-open"
                className="cursor-pointer hover:stroke-cyan-400"
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
              fill="#0891b2"
              fillOpacity="0.85"
              stroke="#06b6d4"
              strokeWidth="1.5"
              data-testid="barre-pill"
              className="transition-all"
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
              className="cursor-pointer transition-transform hover:scale-110"
              onClick={(e) => {
                e.stopPropagation();
                if (marker?.note) onNoteClick?.(marker.note);
              }}
            >
              <circle
                cx={cx}
                cy={cy}
                r={10}
                fill={isActive ? '#38bdf8' : isBarreString ? '#0e7490' : '#0284c7'}
                stroke={isActive ? '#ffffff' : '#38bdf8'}
                strokeWidth="1.8"
                filter={isActive ? 'url(#string-glow)' : undefined}
              />
              {finger && (
                <text
                  x={cx}
                  y={cy + 3.5}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="bold"
                  fill="#ffffff"
                  className="pointer-events-none select-none"
                >
                  {finger}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Card Footer: Tab notation and score badge */}
      <div className="mt-1 flex items-center justify-between px-1 text-[11px] text-neutral-400">
        <span className="font-mono tracking-wider font-semibold text-neutral-200">
          {voicing.tabString}
        </span>
        <span
          className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
            voicing.difficultyScore <= 15
              ? 'bg-emerald-950/80 text-emerald-400 ring-1 ring-emerald-500/30'
              : voicing.difficultyScore <= 25
              ? 'bg-amber-950/80 text-amber-400 ring-1 ring-amber-500/30'
              : 'bg-rose-950/80 text-rose-400 ring-1 ring-rose-500/30'
          }`}
          title={`Score de dificuldade: ${voicing.difficultyScore}`}
        >
          {voicing.difficultyScore <= 15
            ? 'Fácil'
            : voicing.difficultyScore <= 25
            ? 'Médio'
            : 'Difícil'}
        </span>
      </div>
    </div>
  );
};
