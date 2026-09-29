import React, { useState } from 'react';
import { CHORD_ROOTS, MODIFIER_GROUPS, useChordStore } from '../store/chord-store';
import { getChordDefinition } from '../core/fretboard';
import { cn } from '@/lib/utils';
import { SectionTitle } from './SectionTitle';
import { DifficultyPill } from './StatusPill';
import { TabNotation } from './TabNotation';

// Short family labels for the Sufixo column
const FAMILY_LABELS = ['Maior', 'Menor', 'Dom', 'Sus'];

const findFamily = (modifier: string): number =>
  MODIFIER_GROUPS.findIndex((g) => g.modifiers.some((m) => m.value === modifier));

const NoteChip: React.FC<{ children: React.ReactNode; small?: boolean }> = ({ children, small }) => (
  <span
    className={cn(
      'border border-line font-mono leading-none text-text',
      small ? 'rounded-[3px] px-[5px] py-[3px] text-[10px]' : 'rounded-chip px-[7px] py-1 text-[11px]'
    )}
  >
    {children}
  </span>
);

export const ChordSelector: React.FC = () => {
  const {
    root,
    modifier,
    chordSymbol,
    voicings,
    selectedVoicing,
    selectedVoicingId,
    equivalentChords,
    setRoot,
    setModifier,
  } = useChordStore();

  // Family being browsed; follows the active modifier when it changes (e.g. via search)
  const [familyIdx, setFamilyIdx] = useState(() => Math.max(0, findFamily(modifier)));
  const [prevModifier, setPrevModifier] = useState(modifier);
  if (modifier !== prevModifier) {
    setPrevModifier(modifier);
    const f = findFamily(modifier);
    if (f >= 0) setFamilyIdx(f);
  }

  let chordNotes: string[] = [];
  try {
    chordNotes = getChordDefinition(chordSymbol).notes;
  } catch {
    // Unknown symbol: show just the name
  }

  const activeModLabel =
    MODIFIER_GROUPS.flatMap((g) => g.modifiers).find((m) => m.value === modifier)?.label ??
    modifier;
  const selectedIdx = voicings.findIndex((v) => v.id === selectedVoicingId);

  return (
    <div className="flex h-full flex-col gap-(--sec) overflow-y-auto p-(--pad) select-none">
      {/* Acorde: compact card */}
      <section
        aria-label="Acorde"
        className="flex shrink-0 items-center gap-3.5 rounded-oc border border-line bg-card px-3.5 py-3"
      >
        <span className="max-w-[45%] truncate font-mono text-[32px] font-medium leading-none text-accent">
          {chordSymbol}
        </span>
        <div className="flex min-w-0 flex-wrap gap-[5px]">
          {chordNotes.map((note) => (
            <NoteChip key={`tone-${note}`}>{note}</NoteChip>
          ))}
        </div>
        <span className="ml-auto shrink-0 text-right font-mono text-[10px] leading-[1.4] text-muted">
          {voicings.length}
          <br />
          {voicings.length === 1 ? 'posição' : 'posições'}
        </span>
      </section>

      {/* Fundamental */}
      <section className="flex shrink-0 flex-col gap-2.5">
        <SectionTitle label="Fundamental" value={root} />
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
                  'flex h-8 items-center justify-center rounded-oc border font-mono text-xs font-medium transition-colors duration-120',
                  isActive
                    ? 'border-accent bg-accent text-on-accent'
                    : 'border-line bg-card text-text hover:border-muted'
                )}
              >
                {r}
              </button>
            );
          })}
        </div>
      </section>

      {/* Sufixo: family → variation */}
      <section className="flex shrink-0 flex-col gap-2.5">
        <SectionTitle label="Sufixo" value={`${root} · ${activeModLabel || 'Major'}`} />
        <div className="grid grid-cols-[104px_minmax(0,1fr)] overflow-hidden rounded-oc border border-line bg-card">
          <div className="flex flex-col gap-0.5 border-r border-line bg-bg p-1.5" role="group" aria-label="Família">
            {MODIFIER_GROUPS.map((group, idx) => {
              const isActive = familyIdx === idx;
              return (
                <button
                  key={`family-${group.category}`}
                  type="button"
                  onClick={() => setFamilyIdx(idx)}
                  aria-pressed={isActive}
                  title={group.category}
                  className={cn(
                    'flex h-[34px] items-center justify-between rounded-chip px-2.5 text-left text-[13px] transition-colors duration-120',
                    isActive
                      ? 'bg-raised font-semibold text-text'
                      : 'text-muted hover:text-text'
                  )}
                >
                  <span>{FAMILY_LABELS[idx] ?? group.category}</span>
                  {isActive && (
                    <span aria-hidden className="text-[11px] font-normal text-faint">
                      ›
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex min-w-0 flex-col gap-0.5 p-1.5" role="group" aria-label="Variação">
            {MODIFIER_GROUPS[familyIdx].modifiers.map((mod) => {
              const isActive = modifier === mod.value;
              return (
                <button
                  key={`mod-${mod.value}`}
                  type="button"
                  onClick={() => setModifier(mod.value)}
                  aria-pressed={isActive}
                  className={cn(
                    'flex h-[30px] min-w-0 items-center justify-between gap-2 rounded-chip px-2.5 text-left font-mono text-xs transition-colors duration-120',
                    isActive
                      ? 'bg-accent-soft text-accent'
                      : 'text-muted hover:bg-bg hover:text-text'
                  )}
                >
                  <span className="truncate">{mod.label}</span>
                  <span className="shrink-0 text-[10px] text-faint">
                    {root}
                    {mod.value}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Voicing */}
      <section className="flex shrink-0 flex-col gap-2.5">
        <SectionTitle label="Voicing" value={selectedIdx >= 0 ? `#${selectedIdx + 1}` : undefined} />
        <div className="flex flex-col gap-[9px] rounded-oc border border-line bg-card px-3.5 py-3">
          {selectedVoicing ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <TabNotation frets={selectedVoicing.frets} size="lg" className="min-w-0" />
                <DifficultyPill score={selectedVoicing.difficultyScore} className="shrink-0" />
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedVoicing.notes.map((note, i) => (
                  <NoteChip key={`note-${i}`} small>
                    {note}
                  </NoteChip>
                ))}
              </div>
              <div className="flex items-baseline justify-between gap-3 text-xs">
                <span className="text-muted">
                  Baixo <span className="font-mono text-text">{selectedVoicing.bassNote}</span>{' '}
                  {selectedVoicing.isRootInBass ? (
                    <span className="text-easy">· Fundamental</span>
                  ) : (
                    <span className="text-warn">· Inversão</span>
                  )}
                </span>
                <span
                  className="min-w-0 truncate text-muted"
                  title={equivalentChords.length ? equivalentChords.join(', ') : 'Nenhum equivalente direto'}
                >
                  Enarm.{' '}
                  <span className="font-mono text-text">
                    {equivalentChords.length ? equivalentChords.join(' ') : '—'}
                  </span>
                </span>
              </div>
            </>
          ) : (
            <p className="py-3 text-center text-xs text-muted">Nenhum voicing selecionado</p>
          )}
        </div>
      </section>
    </div>
  );
};
