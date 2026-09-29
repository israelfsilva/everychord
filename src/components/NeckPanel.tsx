import React from 'react';
import { ChevronDown } from 'lucide-react';
import { TUNING_PRESETS, useChordStore } from '../store/chord-store';
import { getChordDefinition, getFretNote } from '../core/fretboard';
import { soundEngine } from '../audio/sound-engine';
import { cn } from '@/lib/utils';
import { MuteMark } from './MuteMark';
import { useT } from '@/i18n';

const NOTE_OPTIONS = [
  'C1', 'C#1', 'D1', 'D#1', 'E1', 'F1', 'F#1', 'G1', 'G#1', 'A1', 'A#1', 'B1',
  'C2', 'C#2', 'D2', 'D#2', 'E2', 'F2', 'F#2', 'G2', 'G#2', 'A2', 'A#2', 'B2',
  'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3',
  'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4',
];

const NECK_HEIGHT = 134;
const NUT_X = 3; // % of the neck width
const OPEN_X = 1.4; // where fret-0 notes sit, left of the nut
const SINGLE_INLAYS = [3, 5, 7, 9, 15, 17, 19, 21];
const DOUBLE_INLAYS = [12, 24];

export const NeckPanel: React.FC = () => {
  const {
    chordSymbol,
    tuning,
    tuningPreset,
    constraints,
    selectedVoicing,
    setTuningPreset,
    setStringTuning,
  } = useChordStore();
  const t = useT();

  const numFrets = constraints.upToFret ?? 15;
  const numStrings = tuning.length;

  // Real (equal-temperament) fret spacing, scaled so the last fret hits 100%
  const scale = 1 - Math.pow(2, -numFrets / 12);
  const fretX = (n: number) => NUT_X + (100 - NUT_X) * ((1 - Math.pow(2, -n / 12)) / scale);
  const fretMid = (f: number) => (f === 0 ? OPEN_X : (fretX(f - 1) + fretX(f)) / 2);

  // Row 0 = highest string (1ª corda) on top
  const rowGap = 110 / Math.max(1, numStrings - 1);
  const rowY = (r: number) => 12 + r * rowGap;
  const stringAt = (r: number) => numStrings - 1 - r;

  let chordChromas: number[] = [];
  let chordNames: string[] = [];
  try {
    const def = getChordDefinition(chordSymbol);
    chordChromas = def.chromas;
    chordNames = def.notes;
  } catch {
    // Unknown chord: neck shows only the voicing
  }
  const rootChroma = chordChromas[0];

  type NeckNote = { key: string; x: number; y: number; label: string; note: string; isRoot: boolean };
  const toneMarks: NeckNote[] = [];
  const voicingMarks: NeckNote[] = [];
  const mutedRows: number[] = [];

  for (let r = 0; r < numStrings; r++) {
    const s = stringAt(r);
    const played = selectedVoicing?.frets[s];
    if (played === -1) mutedRows.push(r);

    for (let f = 0; f <= numFrets; f++) {
      const info = getFretNote(tuning[s], f);
      const toneIdx = chordChromas.indexOf(info.chroma);
      const isVoicing = played === f;
      if (toneIdx === -1 && !isVoicing) continue;
      if (played === -1 && f === 0) continue;

      const mark = {
        key: `${s}-${f}`,
        x: fretMid(f),
        y: rowY(r),
        label: toneIdx >= 0 ? chordNames[toneIdx] : info.pitchClass,
        note: info.note,
        isRoot: info.chroma === rootChroma,
      };
      (isVoicing ? voicingMarks : toneMarks).push(mark);
    }
  }

  const fretNumbers = Array.from({ length: numFrets }, (_, i) => i + 1);
  const isMarkedFret = (f: number) => SINGLE_INLAYS.includes(f) || DOUBLE_INLAYS.includes(f);

  return (
    <section
      aria-label={t.neck.title}
      className="flex min-w-0 flex-col gap-2 overflow-hidden rounded-oc border border-line bg-card px-3.5 pt-2.5"
    >
      {/* Header: label · hint · legend · tuning */}
      <div className="flex h-[26px] items-center gap-3">
        <h2 className="eyebrow shrink-0">{t.neck.title}</h2>
        <p className="hidden truncate text-xs text-muted xl:block">
          {t.neck.hintClickDiagram} <span className="text-text">{t.neck.hintStrum}</span> · {t.neck.hintClickDot}{' '}
          <span className="text-text">{t.neck.hintListen}</span>
        </p>
        <span className="flex-1" />
        <span className="hidden shrink-0 items-center gap-1.5 text-[11px] text-muted sm:flex">
          <span className="h-2.5 w-2.5 rounded-full bg-accent" />
          {t.neck.legendVoicing}
        </span>
        <span className="hidden shrink-0 items-center gap-1.5 text-[11px] text-muted sm:flex">
          <span className="h-2.5 w-2.5 rounded-full border border-muted" />
          {t.neck.legendChordTones}
        </span>
        <label className="relative flex h-[26px] shrink-0 items-center gap-2.5 rounded-oc border border-line bg-bg pl-2.5 pr-7 text-xs transition-colors duration-120 focus-within:border-accent hover:border-muted">
          <span className="text-muted">{t.neck.tuning}</span>
          <select
            value={tuningPreset}
            onChange={(e) => setTuningPreset(e.target.value)}
            aria-label={t.neck.tuningPreset}
            className="cursor-pointer appearance-none bg-transparent text-text outline-none"
          >
            {Object.values(TUNING_PRESETS).map((p) => (
              <option key={p.id} value={p.id}>
                {t.neck.tuningNames[p.id] ?? p.name}
              </option>
            ))}
            <option value="custom" disabled={tuningPreset !== 'custom'}>
              {t.neck.custom}
            </option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-muted" />
        </label>
      </div>

      {/* Bleeds into the card's side/bottom padding so the scrollbar (narrow screens) sits on the card edge */}
      <div className="-mx-3.5 overflow-x-auto overflow-y-hidden px-3.5 pb-2 [scrollbar-width:thin]">
        <div className="min-w-[720px]">
          <div className="flex gap-2">
            {/* String names: each is a select so any string can be retuned */}
            <div className="relative w-[26px] shrink-0" style={{ height: NECK_HEIGHT }}>
              {Array.from({ length: numStrings }, (_, r) => {
                const s = stringAt(r);
                return (
                  <select
                    key={`tune-${s}`}
                    value={tuning[s]}
                    onChange={(e) => setStringTuning(s, e.target.value)}
                    aria-label={t.neck.stringTuning(r + 1)}
                    title={t.neck.stringTitle(r + 1)}
                    className="absolute right-0 w-[34px] -translate-y-1/2 cursor-pointer appearance-none rounded-[3px] bg-transparent text-right font-mono text-[10px] font-bold leading-[14px] text-accent outline-none hover:bg-accent-soft focus-visible:bg-accent-soft"
                    style={{ top: rowY(r) }}
                  >
                    {NOTE_OPTIONS.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                );
              })}
            </div>

            {/* Neck */}
            <div className="relative flex-1" style={{ height: NECK_HEIGHT }}>
              <div
                className="absolute right-0 rounded-[2px] bg-bg"
                style={{ left: `${NUT_X}%`, top: 4, height: NECK_HEIGHT - 8 }}
              />

              {SINGLE_INLAYS.filter((f) => f <= numFrets).map((f) => (
                <span
                  key={`inlay-${f}`}
                  className="absolute -ml-1 -mt-1 h-2 w-2 rounded-full bg-raised"
                  style={{ left: `${fretMid(f)}%`, top: NECK_HEIGHT / 2 }}
                />
              ))}
              {DOUBLE_INLAYS.filter((f) => f <= numFrets).flatMap((f) =>
                [NECK_HEIGHT / 3, (NECK_HEIGHT * 2) / 3].map((y) => (
                  <span
                    key={`inlay-${f}-${y}`}
                    className="absolute -ml-1 -mt-1 h-2 w-2 rounded-full bg-raised"
                    style={{ left: `${fretMid(f)}%`, top: y }}
                  />
                ))
              )}

              {fretNumbers.map((f) => (
                <span
                  key={`fret-${f}`}
                  // Last fret is right-aligned so it doesn't overflow the neck by 1px
                  className={cn('absolute w-0.5 bg-fret', f === numFrets ? '-ml-0.5' : '-ml-px')}
                  style={{ left: `${fretX(f)}%`, top: 4, height: NECK_HEIGHT - 8 }}
                />
              ))}

              <span
                className="absolute -ml-0.5 w-1 rounded-[1px] bg-text opacity-85"
                style={{ left: `${NUT_X}%`, top: 2, height: NECK_HEIGHT - 4 }}
              />

              {Array.from({ length: numStrings }, (_, r) => {
                const h = 1 + (r / Math.max(1, numStrings - 1)) * 2.5;
                return (
                  <span
                    key={`string-${r}`}
                    className="absolute right-0 bg-muted opacity-60"
                    style={{ left: `${NUT_X}%`, top: rowY(r) - h / 2, height: h }}
                  />
                );
              })}

              {toneMarks.map((m) => (
                <button
                  key={`tone-${m.key}`}
                  type="button"
                  onClick={() => soundEngine.playNote(m.note)}
                  aria-label={t.neck.playNote(m.note)}
                  className={cn(
                    'absolute -ml-[9px] -mt-[9px] flex h-[18px] w-[18px] items-center justify-center rounded-full border bg-card font-mono text-[9px] leading-none transition-colors duration-120 hover:border-accent hover:text-accent',
                    m.isRoot ? 'border-muted text-text' : 'border-fret text-muted'
                  )}
                  style={{ left: `${m.x}%`, top: m.y }}
                >
                  {m.label}
                </button>
              ))}

              {voicingMarks.map((m) => (
                <button
                  key={`sel-${m.key}`}
                  type="button"
                  onClick={() => soundEngine.playNote(m.note)}
                  aria-label={t.neck.playVoicingNote(m.note)}
                  className="absolute -ml-2.5 -mt-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent font-mono text-[9px] font-bold leading-none text-on-accent shadow-[0_0_0_3px_var(--accent-soft)]"
                  style={{ left: `${m.x}%`, top: m.y }}
                >
                  {m.label}
                </button>
              ))}

              {mutedRows.map((r) => (
                <MuteMark
                  key={`muted-${r}`}
                  className="absolute -ml-[3px] -mt-[3px]"
                  style={{ left: `${OPEN_X}%`, top: rowY(r) }}
                />
              ))}
            </div>
          </div>

          {/* Fret numbers */}
          <div className="relative ml-[34px] h-3" aria-hidden>
            {fretNumbers.map((f) => (
              <span
                key={`num-${f}`}
                className={cn(
                  'absolute -ml-2.5 w-5 text-center font-mono text-[9px] leading-3',
                  isMarkedFret(f) ? 'text-text' : 'text-faint'
                )}
                style={{ left: `${fretMid(f)}%` }}
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
