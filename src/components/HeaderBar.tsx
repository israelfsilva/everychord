import React from 'react';
import { Volume2, Music, Hand } from 'lucide-react';
import { useChordStore } from '../store/chord-store';
import { soundEngine } from '../audio/sound-engine';

export const HeaderBar: React.FC = () => {
  const {
    chordSymbol,
    voicings,
    selectedVoicing,
    isLeftHanded,
    isPlaying,
    setIsLeftHanded,
  } = useChordStore();

  const handlePlaySelected = () => {
    if (selectedVoicing) {
      soundEngine.strumChord(selectedVoicing);
    }
  };

  return (
    <header className="flex h-14 w-full shrink-0 items-center justify-between border-b border-neutral-800 bg-neutral-950/90 px-4 backdrop-blur-md">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/20">
          <Music className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold tracking-wider text-neutral-100 uppercase">
              Open<span className="text-cyan-400">Chords</span>
            </h1>
            <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
              Client-Side Engine
            </span>
          </div>
          <p className="text-[11px] text-neutral-400">
            Algoritmo combinatório puro • Sem banco estático
          </p>
        </div>
      </div>

      {/* Middle Status Pill */}
      <div className="hidden items-center gap-3 md:flex">
        <div className="flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/80 px-3 py-1 text-xs text-neutral-300">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Acorde Ativo:</span>
          <span className="font-mono font-bold text-cyan-300">{chordSymbol}</span>
          <span className="text-neutral-600">•</span>
          <span className="text-neutral-400 font-mono">
            {voicings.length} {voicings.length === 1 ? 'posição' : 'posições'}
          </span>
        </div>
      </div>

      {/* Quick Action Controls */}
      <div className="flex items-center gap-2">
        {/* Left-Hand Toggle */}
        <button
          type="button"
          onClick={() => setIsLeftHanded(!isLeftHanded)}
          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all ${
            isLeftHanded
              ? 'border-amber-500/50 bg-amber-950/40 text-amber-300'
              : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
          }`}
          title="Alternar modo canhoto (inverte a ordem das cordas no diagrama)"
          aria-label="Modo Canhoto"
        >
          <Hand className="h-3.5 w-3.5" />
          <span>Canhoto</span>
        </button>

        {/* Play Current Voicing Button */}
        <button
          type="button"
          onClick={handlePlaySelected}
          disabled={!selectedVoicing || isPlaying}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold tracking-wide transition-all shadow-sm ${
            isPlaying
              ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 ring-2 ring-cyan-500/40'
              : 'border-cyan-600 bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:brightness-110 active:scale-95'
          } disabled:cursor-not-allowed disabled:opacity-50`}
          title="Dedilhar acorde selecionado (strumming)"
          aria-label="Dedilhar Acorde"
        >
          {isPlaying ? (
            <Volume2 className="h-3.5 w-3.5 animate-bounce" />
          ) : (
            <Volume2 className="h-3.5 w-3.5" />
          )}
          <span>{isPlaying ? 'Dedilhando...' : 'Dedilhar'}</span>
        </button>
      </div>
    </header>
  );
};
