import React from 'react';
import { Popover } from '@base-ui/react/popover';
import { ChevronDown, RotateCcw } from 'lucide-react';
import { DEFAULT_CONSTRAINTS, useChordStore } from '../store/chord-store';
import type { SearchConstraints } from '../core/types';
import { cn } from '@/lib/utils';

type ToggleKey = 'noBarre' | 'easyOnly' | 'omit5' | 'omit3' | 'allowInversions';

const FILTER_TOGGLES: { key: ToggleKey; label: string; title: string }[] = [
  { key: 'noBarre', label: 'Sem pestanas', title: 'Sem Pestanas' },
  { key: 'easyOnly', label: 'Easy', title: 'Easy Chords' },
  { key: 'omit5', label: 'Omit 5ª', title: 'Omitir 5ª (Omit 5th)' },
  { key: 'omit3', label: 'Omit 3ª', title: 'Omitir 3ª (Omit 3rd)' },
  { key: 'allowInversions', label: 'Inversões', title: 'Permitir Inversões (Slash Chords)' },
];

interface SliderFilterProps {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

/** Compact dropdown ("Distância 4 casas ⌄") that opens a popover with the slider. */
const SliderFilter: React.FC<SliderFilterProps> = ({ label, value, display, min, max, onChange }) => {
  const fill = `${((value - min) / (max - min)) * 100}%`;
  return (
    <Popover.Root>
      <Popover.Trigger
        className="flex h-7 shrink-0 items-center gap-1.5 rounded-oc border border-line bg-card px-2.5 text-xs transition-colors duration-120 hover:border-muted data-[popup-open]:border-accent"
      >
        <span className="text-muted">{label}</span>
        <span className="font-mono text-text">{display}</span>
        <ChevronDown className="h-3 w-3 text-faint" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="bottom" align="start" sideOffset={6} className="z-50">
          <Popover.Popup className="flex w-60 flex-col gap-3 rounded-oc border border-line bg-card p-3.5 text-xs text-text shadow-[0_12px_32px_rgb(0_0_0/0.18)] outline-none">
            <label className="flex flex-col gap-3">
              <span className="flex justify-between">
                <span className="text-muted">{label}</span>
                <span className="font-mono">{display}</span>
              </span>
              <input
                type="range"
                min={min}
                max={max}
                step={1}
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value, 10))}
                aria-label={label}
                className="oc-range w-full"
                style={{ '--fill': fill } as React.CSSProperties}
              />
              <span className="flex justify-between font-mono text-[10px] text-faint">
                <span>{min}</span>
                <span>{max}</span>
              </span>
            </label>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
};

export const FilterBar: React.FC<{ className?: string }> = ({ className }) => {
  const { constraints, setConstraints } = useChordStore();
  const maxSpan = constraints.maxSpan ?? 4;
  const upToFret = constraints.upToFret ?? 15;

  const isDefault = (Object.keys(DEFAULT_CONSTRAINTS) as (keyof SearchConstraints)[]).every(
    (k) => constraints[k] === DEFAULT_CONSTRAINTS[k]
  );

  return (
    <div className={cn('flex items-center gap-1.5 text-xs', className)}>
      <SliderFilter
        label="Distância"
        value={maxSpan}
        display={`${maxSpan} casas`}
        min={3}
        max={5}
        onChange={(v) => setConstraints({ maxSpan: v })}
      />
      <SliderFilter
        label="Até a casa"
        value={upToFret}
        display={`${upToFret}ª`}
        min={10}
        max={24}
        onChange={(v) => setConstraints({ upToFret: v })}
      />

      <span className="mx-1 h-[18px] w-px shrink-0 bg-line" aria-hidden />

      {FILTER_TOGGLES.map(({ key, label, title }) => {
        const on = Boolean(constraints[key]);
        return (
          <button
            key={key}
            type="button"
            aria-pressed={on}
            title={title}
            onClick={() => setConstraints({ [key]: !on })}
            className={cn(
              'h-7 shrink-0 rounded-[14px] border px-2.5 whitespace-nowrap transition-colors duration-120',
              on
                ? 'border-solid border-accent bg-accent-soft text-accent'
                : 'border-dashed border-line text-muted hover:border-muted hover:text-text'
            )}
          >
            {label}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => setConstraints(DEFAULT_CONSTRAINTS)}
        disabled={isDefault}
        title="Padrão (resetar filtros)"
        aria-label="Resetar filtros"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-oc text-muted transition-colors duration-120 hover:text-text disabled:opacity-40 disabled:hover:text-muted"
      >
        <RotateCcw className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
