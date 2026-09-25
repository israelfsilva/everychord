import React, { useState } from 'react';
import {
  CHORD_ROOTS,
  MODIFIER_GROUPS,
  useChordStore,
} from '../store/chord-store';
import { getChordDefinition } from '../core/fretboard';
import { cn } from '@/lib/utils';

// Short labels so the four category tabs fit in one segmented row
const categoryLabel = (category: string): string => {
  const first = category.split(' ')[0];
  return first === 'Dominante' ? 'Dom' : first;
};

export const ChordSelector: React.FC = () => {
  const { root, modifier, chordSymbol, voicings, setRoot, setModifier } = useChordStore();

  const [selectedCategoryIdx, setSelectedCategoryIdx] = useState(0);

  let chordNotes: string[] = [];
  try {
    chordNotes = getChordDefinition(chordSymbol).notes;
  } catch {
    // Unknown symbol: show just the name
  }

  return (
    <div className="flex h-full w-full flex-col gap-5 overflow-y-auto border-r border-sidebar-border bg-sidebar p-4 select-none">
      {/* Current chord: headline figure, like the reference's KPI cards */}
      <section className="shrink-0 rounded-md surface-well p-1">
        <div className="flex h-8 items-center justify-between px-2.5">
          <h2 className="eyebrow">Acorde</h2>
          <span className="font-mono text-[11px] text-muted-foreground">
            {voicings.length} {voicings.length === 1 ? 'posição' : 'posições'}
          </span>
        </div>
        <div className="flex flex-col gap-2 rounded-sm surface-raised px-3 py-2.5">
          <span className="truncate font-mono text-4xl font-semibold leading-tight text-primary-text">
            {chordSymbol}
          </span>
          {chordNotes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {chordNotes.map((note) => (
                <span
                  key={`tone-${note}`}
                  className="rounded-sm border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground"
                >
                  {note}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Root Note Selector */}
      <div className="flex shrink-0 flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="eyebrow">Fundamental</span>
          <span className="font-mono text-xs font-semibold text-primary-text">{root}</span>
        </div>
        <div className="grid grid-cols-6 gap-1.5">
          {CHORD_ROOTS.map((r) => {
            const isActive = root === r;
            return (
              <button
                key={`root-${r}`}
                type="button"
                onClick={() => setRoot(r)}
                aria-pressed={isActive}
                className={cn(
                  'flex h-8 items-center justify-center rounded-md font-mono text-xs font-semibold transition-colors',
                  isActive
                    ? 'surface-primary'
                    : 'surface-raised text-foreground hover:bg-accent'
                )}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>

      {/* Modifiers Categories & Selector */}
      <div className="flex shrink-0 flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="eyebrow">Qualidade</span>
          <span className="font-mono text-xs font-semibold text-primary-text">
            {modifier || 'M'}
          </span>
        </div>

        {/* Category Tabs (segmented control) */}
        <div className="flex gap-1 rounded-md surface-well p-1">
          {MODIFIER_GROUPS.map((group, idx) => {
            const isTabActive = selectedCategoryIdx === idx;
            return (
              <button
                key={`group-tab-${group.category}`}
                type="button"
                onClick={() => setSelectedCategoryIdx(idx)}
                aria-pressed={isTabActive}
                title={group.category}
                className={cn(
                  'min-w-0 flex-1 truncate rounded-sm px-2 py-1 text-xs font-medium transition-colors',
                  isTabActive
                    ? 'surface-raised text-foreground'
                    : 'border border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                {categoryLabel(group.category)}
              </button>
            );
          })}
        </div>

        {/* Modifier Buttons Grid */}
        <div className="grid grid-cols-2 gap-1">
          {MODIFIER_GROUPS[selectedCategoryIdx].modifiers.map((mod) => {
            const isModActive = modifier === mod.value;
            return (
              <button
                key={`mod-${mod.value}`}
                type="button"
                onClick={() => setModifier(mod.value)}
                aria-pressed={isModActive}
                className={cn(
                  'relative flex h-8 items-center rounded-md px-3 text-left font-mono text-xs transition-colors',
                  isModActive
                    ? 'bg-sidebar-accent font-semibold text-primary-text before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-primary'
                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
                )}
              >
                <span className="truncate">{mod.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
