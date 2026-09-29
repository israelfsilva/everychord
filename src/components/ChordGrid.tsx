import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { DEFAULT_CONSTRAINTS, useChordStore } from '../store/chord-store';
import { soundEngine } from '../audio/sound-engine';
import { FretboardDiagram } from './FretboardDiagram';
import { FilterBar } from './FilterBar';
import type { ChordVoicing } from '../core/types';
import { useT } from '@/i18n';

export const ChordGrid: React.FC = () => {
  const {
    voicings,
    selectedVoicingId,
    isLeftHanded,
    activeStringIndex,
    selectVoicing,
    setConstraints,
  } = useChordStore();
  const t = useT();

  const handleStrum = (voicing: ChordVoicing) => {
    selectVoicing(voicing.id);
    soundEngine.strumChord(voicing);
  };

  const handleNoteClick = (note: string) => {
    soundEngine.playNote(note);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-12 shrink-0 items-center gap-2.5 border-b border-line px-(--pad)">
        <h2 className="eyebrow shrink-0">{t.grid.diagrams}</h2>
        <span className="shrink-0 rounded-[3px] bg-raised px-1.5 py-0.5 font-mono text-[10px] text-muted">
          {voicings.length}
        </span>
        <span className="flex-1" />
        <FilterBar className="-mr-(--pad) min-w-0 overflow-x-auto pr-(--pad) [scrollbar-width:none]" />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-(--pad)">
        {voicings.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <div className="rounded-full border border-line bg-card p-4 text-muted">
              <Filter className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-text">
                {t.grid.emptyTitle}
              </p>
              <p className="mt-1 text-xs text-muted">
                {t.grid.emptyHint}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setConstraints(DEFAULT_CONSTRAINTS)}
              className="mt-2 flex items-center gap-1.5 rounded-oc border border-line bg-card px-3 py-1.5 text-xs font-medium text-text transition-colors duration-120 hover:border-muted"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{t.grid.restoreDefaults}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(184px,1fr))] content-start gap-(--gap)">
            {voicings.map((voicing, idx) => {
              const isSelected = voicing.id === selectedVoicingId;
              return (
                <FretboardDiagram
                  key={voicing.id}
                  voicing={voicing}
                  index={idx + 1}
                  isLeftHanded={isLeftHanded}
                  isSelected={isSelected}
                  activeStringIndex={isSelected ? activeStringIndex : null}
                  onStrum={handleStrum}
                  onNoteClick={handleNoteClick}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
