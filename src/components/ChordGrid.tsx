import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { useChordStore } from '../store/chord-store';
import { soundEngine } from '../audio/sound-engine';
import { FretboardDiagram } from './FretboardDiagram';
import type { ChordVoicing } from '../core/types';

export const ChordGrid: React.FC = () => {
  const {
    voicings,
    selectedVoicingId,
    isLeftHanded,
    activeStringIndex,
    selectVoicing,
    setConstraints,
  } = useChordStore();

  const handleStrum = (voicing: ChordVoicing) => {
    selectVoicing(voicing.id);
    soundEngine.strumChord(voicing);
  };

  const handleNoteClick = (note: string) => {
    soundEngine.playNote(note);
  };

  const handleResetFilters = () => {
    setConstraints({
      maxSpan: 4,
      upToFret: 15,
      omit5: false,
      omit3: false,
      noBarre: false,
      easyOnly: false,
      allowInversions: false,
    });
  };

  return (
    <div className="h-full w-full bg-background">
      {/* Stage: darker recessed area so the diagram cards stand out from the surrounding panels */}
      <div className="flex h-full w-full flex-col overflow-hidden surface-stage">
        {/* Sub-header info */}
        <div className="flex h-12 shrink-0 items-center justify-between gap-4 border-b border-border px-5">
          <div className="flex items-center gap-2.5">
            <span className="eyebrow">Diagramas</span>
            <span className="rounded-sm border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
              {voicings.length}
            </span>
          </div>

          <p className="truncate text-xs text-muted-foreground">
            Clique no diagrama para <span className="text-foreground">dedilhar</span> · clique na bolinha para <span className="text-foreground">ouvir a nota</span>
          </p>
        </div>

        {/* Grid container with smooth vertical scrolling */}
        <div className="flex-1 overflow-y-auto p-5">
          {voicings.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <div className="rounded-full surface-well p-4 text-muted-foreground">
                <Filter className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Nenhuma posição encontrada com os filtros atuais
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Tente aumentar a distância de casas (fret span) ou permitir pestanas.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-2 flex items-center gap-1.5 rounded-md surface-raised px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Restaurar Filtros Padrão</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(176px,1fr))] gap-4">
              {voicings.map((voicing, idx) => {
                const isSelected = voicing.id === selectedVoicingId;

                return (
                  <div key={voicing.id} className="relative group">
                    {/* Position number */}
                    <span className="pointer-events-none absolute left-4 top-4 z-10 font-mono text-[10px] font-medium text-muted-foreground">
                      #{idx + 1}
                    </span>

                    <FretboardDiagram
                      voicing={voicing}
                      isLeftHanded={isLeftHanded}
                      isSelected={isSelected}
                      activeStringIndex={isSelected ? activeStringIndex : null}
                      onStrum={handleStrum}
                      onNoteClick={handleNoteClick}
                      displayScale={0.8}
                    className="w-full"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
