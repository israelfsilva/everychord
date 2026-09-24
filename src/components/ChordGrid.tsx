import React from 'react';
import { Music, Filter, RotateCcw } from 'lucide-react';
import { useChordStore } from '../store/chord-store';
import { soundEngine } from '../audio/sound-engine';
import { FretboardDiagram } from './FretboardDiagram';
import type { ChordVoicing } from '../core/types';

export const ChordGrid: React.FC = () => {
  const {
    chordSymbol,
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
    <div className="flex h-full w-full flex-col overflow-hidden bg-neutral-900/40">
      {/* Sub-header info */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-neutral-800 bg-neutral-950/60 px-4">
        <div className="flex items-center gap-2">
          <Music className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-semibold text-neutral-300">
            Diagramas Gerados para{' '}
            <span className="font-mono font-bold text-cyan-300">{chordSymbol}</span>
          </span>
          <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] font-mono text-neutral-400">
            {voicings.length}
          </span>
        </div>

        <div className="text-[11px] text-neutral-400">
          Clique no diagrama para <span className="text-cyan-400">dedilhar</span> • Clique na bolinha para <span className="text-cyan-400">nota isolada</span>
        </div>
      </div>

      {/* Grid container with smooth vertical scrolling */}
      <div className="flex-1 overflow-y-auto p-4">
        {voicings.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <div className="rounded-full bg-neutral-800/80 p-4 text-neutral-500">
              <Filter className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-300">
                Nenhuma posição encontrada com os filtros atuais
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                Tente aumentar a distância de casas (fret span) ou permitir pestanas.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-2 flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-900/40"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Restaurar Filtros Padrão</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-4">
            {voicings.map((voicing, idx) => {
              const isSelected = voicing.id === selectedVoicingId;

              return (
                <div key={voicing.id} className="relative group">
                  {/* Position number pill */}
                  <span className="absolute left-4 top-4 z-10 rounded bg-neutral-900/90 px-1.5 py-0.5 font-mono text-[9px] font-bold text-neutral-400 ring-1 ring-neutral-700/60 pointer-events-none">
                    #{idx + 1}
                  </span>

                  <FretboardDiagram
                    voicing={voicing}
                    isLeftHanded={isLeftHanded}
                    isSelected={isSelected}
                    activeStringIndex={isSelected ? activeStringIndex : null}
                    onStrum={handleStrum}
                    onNoteClick={handleNoteClick}
                    className="w-full"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
