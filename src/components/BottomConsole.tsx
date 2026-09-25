import React from 'react';
import { RotateCcw, ChevronDown } from 'lucide-react';
import {
  TUNING_PRESETS,
  useChordStore,
} from '../store/chord-store';
import type { SearchConstraints } from '../core/types';
import { Switch } from './ui/switch';
import { DifficultyPill, StatusPill } from './StatusPill';

const NOTE_OPTIONS = [
  'C1', 'C#1', 'D1', 'D#1', 'E1', 'F1', 'F#1', 'G1', 'G#1', 'A1', 'A#1', 'B1',
  'C2', 'C#2', 'D2', 'D#2', 'E2', 'F2', 'F#2', 'G2', 'G#2', 'A2', 'A#2', 'B2',
  'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3',
  'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4',
];

type ToggleKey = 'noBarre' | 'easyOnly' | 'omit5' | 'omit3' | 'allowInversions';

const FILTER_TOGGLES: { key: ToggleKey; label: string; wide?: boolean }[] = [
  { key: 'noBarre', label: 'Sem Pestanas' },
  { key: 'easyOnly', label: 'Easy Chords' },
  { key: 'omit5', label: 'Omitir 5ª (Omit 5th)' },
  { key: 'omit3', label: 'Omitir 3ª (Omit 3rd)' },
  { key: 'allowInversions', label: 'Permitir Inversões (Slash Chords)', wide: true },
];

const DEFAULT_CONSTRAINTS: SearchConstraints = {
  maxSpan: 4,
  upToFret: 15,
  omit5: false,
  omit3: false,
  noBarre: false,
  easyOnly: false,
  allowInversions: false,
};

const Card: React.FC<{ title: string; action?: React.ReactNode; children: React.ReactNode }> = ({
  title,
  action,
  children,
}) => (
  <section className="flex min-w-0 flex-col overflow-hidden rounded-md surface-well p-1">
    {/* Header sits on the recessed shell, content on the raised panel */}
    <div className="flex h-8 shrink-0 items-center justify-between gap-2 px-3">
      <h2 className="eyebrow">{title}</h2>
      {action}
    </div>
    <div className="flex flex-1 flex-col gap-2.5 rounded-md surface-raised p-2.5">
      {children}
    </div>
  </section>
);

const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground">
    {children}
  </span>
);

export const BottomConsole: React.FC = () => {
  const {
    selectedVoicing,
    equivalentChords,
    tuning,
    tuningPreset,
    constraints,
    setTuningPreset,
    setStringTuning,
    setConstraints,
  } = useChordStore();

  return (
    <div className="grid w-full shrink-0 grid-cols-3 gap-3 border-t border-border bg-background p-3 select-none">
      {/* SECTION 1: Selected Chord Details & Enharmonics */}
      <Card
        title="Voicing"
        action={selectedVoicing && <DifficultyPill score={selectedVoicing.difficultyScore} />}
      >
        {selectedVoicing ? (
          <div className="flex flex-col gap-2">
            {/* Tablature as the headline figure */}
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-semibold tracking-[0.12em] text-foreground">
                {selectedVoicing.tabString}
              </span>
              <span className="text-xs text-muted-foreground">tablatura</span>
            </div>

            <dl className="flex flex-col gap-1 text-xs">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Notas</dt>
                <dd className="flex flex-wrap justify-end gap-1">
                  {selectedVoicing.notes.map((note, i) => (
                    <Chip key={`note-${i}`}>{note}</Chip>
                  ))}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Baixo</dt>
                <dd className="flex items-center gap-1.5">
                  <span className="font-mono font-semibold text-foreground">
                    {selectedVoicing.bassNote}
                  </span>
                  {selectedVoicing.isRootInBass ? (
                    <StatusPill tone="success">Fundamental</StatusPill>
                  ) : (
                    <StatusPill tone="warning">Inversão</StatusPill>
                  )}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-2">
                <dt className="shrink-0 text-muted-foreground">Enarmônicos</dt>
                <dd className="flex min-w-0 flex-wrap justify-end gap-1">
                  {equivalentChords.length > 0 ? (
                    equivalentChords.map((eq) => <Chip key={`eq-${eq}`}>{eq}</Chip>)
                  ) : (
                    <span className="text-muted-foreground">Nenhum equivalente direto</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center text-xs text-muted-foreground">
            Nenhum voicing selecionado
          </div>
        )}
      </Card>

      {/* SECTION 2: String Tuning Controls & Presets */}
      <Card
        title="Afinação"
        action={
          <span className="font-mono text-[11px] text-muted-foreground">
            {tuning.length} cordas
          </span>
        }
      >
        {/* Preset dropdown */}
        <div className="relative">
          <select
            value={tuningPreset}
            onChange={(e) => setTuningPreset(e.target.value)}
            aria-label="Preset de afinação"
            className="h-8 w-full cursor-pointer appearance-none rounded-md surface-raised pl-3 pr-8 text-sm text-foreground transition-colors hover:bg-accent focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {Object.values(TUNING_PRESETS).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
            <option value="custom">Customizada (Manual)</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>

        {/* Individual string pickers */}
        <div
          className="grid gap-1.5"
          style={{ gridTemplateColumns: `repeat(${tuning.length}, minmax(0, 1fr))` }}
        >
          {tuning.map((currentNote, sIdx) => (
            <label
              key={`str-tune-${sIdx}`}
              className="flex flex-col items-center gap-0.5 rounded-md surface-well py-1.5 transition-colors hover:bg-accent"
            >
              <span className="font-mono text-[10px] text-muted-foreground">
                {tuning.length - sIdx}ª
              </span>
              <select
                value={currentNote}
                onChange={(e) => setStringTuning(sIdx, e.target.value)}
                aria-label={`Afinação da ${tuning.length - sIdx}ª corda`}
                className="w-full cursor-pointer appearance-none bg-transparent text-center font-mono text-sm font-semibold text-primary-text focus:outline-none"
              >
                {NOTE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </Card>

      {/* SECTION 3: Search Constraints & Hand Ergonomics Filters */}
      <Card
        title="Filtros"
        action={
          <button
            type="button"
            onClick={() => setConstraints(DEFAULT_CONSTRAINTS)}
            className="flex h-6 items-center gap-1 rounded-md px-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            title="Resetar filtros"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Padrão</span>
          </button>
        }
      >
        {/* Sliders for Span and Up to Fret */}
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="flex justify-between text-xs">
              <span className="text-muted-foreground">Distância</span>
              <span className="font-mono font-semibold text-foreground">
                {constraints.maxSpan ?? 4} casas
              </span>
            </span>
            <input
              type="range"
              min={3}
              max={5}
              step={1}
              value={constraints.maxSpan ?? 4}
              onChange={(e) => setConstraints({ maxSpan: parseInt(e.target.value, 10) })}
              className="cursor-pointer accent-primary"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="flex justify-between text-xs">
              <span className="text-muted-foreground">Até a casa</span>
              <span className="font-mono font-semibold text-foreground">
                {constraints.upToFret ?? 15}ª
              </span>
            </span>
            <input
              type="range"
              min={10}
              max={24}
              step={1}
              value={constraints.upToFret ?? 15}
              onChange={(e) => setConstraints({ upToFret: parseInt(e.target.value, 10) })}
              className="cursor-pointer accent-primary"
            />
          </label>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
          {FILTER_TOGGLES.map(({ key, label, wide }) => (
            <label
              key={key}
              className={`flex cursor-pointer items-center gap-2 text-foreground ${wide ? 'col-span-2' : ''}`}
            >
              <Switch
                size="sm"
                checked={Boolean(constraints[key])}
                onCheckedChange={(checked) => setConstraints({ [key]: checked })}
              />
              <span className="truncate">{label}</span>
            </label>
          ))}
        </div>
      </Card>
    </div>
  );
};
