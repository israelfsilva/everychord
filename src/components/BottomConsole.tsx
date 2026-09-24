import React from 'react';
import {
  Sliders,
  Info,
  RotateCcw,
  Guitar,
} from 'lucide-react';
import {
  TUNING_PRESETS,
  useChordStore,
} from '../store/chord-store';
import { soundEngine } from '../audio/sound-engine';

const NOTE_OPTIONS = [
  'C1', 'C#1', 'D1', 'D#1', 'E1', 'F1', 'F#1', 'G1', 'G#1', 'A1', 'A#1', 'B1',
  'C2', 'C#2', 'D2', 'D#2', 'E2', 'F2', 'F#2', 'G2', 'G#2', 'A2', 'A#2', 'B2',
  'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3',
  'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4',
];

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

  const handleStrumSelected = () => {
    if (selectedVoicing) {
      soundEngine.strumChord(selectedVoicing);
    }
  };

  return (
    <div className="flex h-56 w-full shrink-0 flex-col border-t border-neutral-800 bg-neutral-950/95 lg:flex-row select-none">
      {/* SECTION 1: Selected Chord Details & Enharmonics */}
      <div className="flex w-full flex-col justify-between border-b border-neutral-800 p-3 sm:w-1/3 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-300 uppercase tracking-wider">
            <Info className="h-3.5 w-3.5 text-cyan-400" />
            <span>Voicing Selecionado</span>
          </div>
          {selectedVoicing && (
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-bold ${
                selectedVoicing.difficultyScore <= 15
                  ? 'bg-emerald-950 text-emerald-400'
                  : selectedVoicing.difficultyScore <= 25
                  ? 'bg-amber-950 text-amber-400'
                  : 'bg-rose-950 text-rose-400'
              }`}
            >
              Score: {selectedVoicing.difficultyScore}
            </span>
          )}
        </div>

        {selectedVoicing ? (
          <div className="flex flex-col gap-2">
            {/* Tablature string in big mono display */}
            <div className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900/80 px-3 py-1.5">
              <span className="text-[11px] text-neutral-400">Tablatura:</span>
              <span className="font-mono text-base font-extrabold tracking-widest text-cyan-300">
                {selectedVoicing.tabString}
              </span>
            </div>

            {/* Sounding notes */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">Notas Soando:</span>
              <span className="font-mono font-medium text-neutral-200">
                {selectedVoicing.notes.join(' • ')}
              </span>
            </div>

            {/* Bass Note and Inversion info */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">Nota no Baixo:</span>
              <span className="font-mono font-semibold text-neutral-200">
                {selectedVoicing.bassNote}{' '}
                {selectedVoicing.isRootInBass ? (
                  <span className="text-emerald-400 text-[10px]">(Fundamental)</span>
                ) : (
                  <span className="text-amber-400 text-[10px]">(Inversão)</span>
                )}
              </span>
            </div>

            {/* Equivalent / Enharmonic Chords */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider text-neutral-500">
                Enarmônicos & Equivalentes:
              </span>
              <div className="flex flex-wrap gap-1">
                {equivalentChords.length > 0 ? (
                  equivalentChords.map((eq) => (
                    <span
                      key={`eq-${eq}`}
                      className="rounded border border-neutral-700/60 bg-neutral-800/80 px-1.5 py-0.5 font-mono text-[10px] text-cyan-300"
                    >
                      {eq}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-neutral-500 italic">
                    Nenhum equivalente direto
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-neutral-500 italic">
            Nenhum voicing selecionado
          </div>
        )}

        {/* Quick Strum Trigger */}
        <button
          type="button"
          onClick={handleStrumSelected}
          disabled={!selectedVoicing}
          className="w-full rounded border border-neutral-700/80 bg-neutral-900 py-1 text-[11px] font-semibold text-neutral-200 hover:border-cyan-500 hover:text-cyan-300 transition-all disabled:opacity-50"
        >
          Ouvir Arpejo da Posição
        </button>
      </div>

      {/* SECTION 2: String Tuning Controls & Presets */}
      <div className="flex w-full flex-col justify-between border-b border-neutral-800 p-3 sm:w-1/3 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-300 uppercase tracking-wider">
            <Guitar className="h-3.5 w-3.5 text-cyan-400" />
            <span>Afinação por Corda</span>
          </div>
          <span className="text-[10px] font-mono text-neutral-400">
            {tuning.length} cordas
          </span>
        </div>

        {/* Preset Select Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-neutral-400">Preset:</span>
          <select
            value={tuningPreset}
            onChange={(e) => setTuningPreset(e.target.value)}
            className="flex-1 rounded border border-neutral-800 bg-neutral-900 px-2 py-1 text-xs text-neutral-200 focus:border-cyan-500 focus:outline-none font-mono"
          >
            {Object.values(TUNING_PRESETS).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
            <option value="custom">Customizada (Manual)</option>
          </select>
        </div>

        {/* Individual string pickers */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto py-1">
          {tuning.map((currentNote, sIdx) => (
            <div
              key={`str-tune-${sIdx}`}
              className="flex flex-col items-center gap-1 rounded border border-neutral-800/80 bg-neutral-900/60 p-1.5"
            >
              <span className="text-[9px] font-mono text-neutral-500">
                {tuning.length - sIdx}ª
              </span>
              <select
                value={currentNote}
                onChange={(e) => setStringTuning(sIdx, e.target.value)}
                className="w-12 rounded border border-neutral-700 bg-neutral-950 px-1 py-0.5 text-center font-mono text-[11px] font-bold text-cyan-400 focus:border-cyan-400 focus:outline-none"
              >
                {NOTE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-neutral-500 italic text-center">
          Altere a afinação de qualquer corda para recálculo instantâneo
        </p>
      </div>

      {/* SECTION 3: Search Constraints & Hand Ergonomics Filters */}
      <div className="flex w-full flex-col justify-between p-3 sm:w-1/3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-300 uppercase tracking-wider">
            <Sliders className="h-3.5 w-3.5 text-cyan-400" />
            <span>Filtros & Ergonomia</span>
          </div>
          <button
            type="button"
            onClick={() =>
              setConstraints({
                maxSpan: 4,
                upToFret: 15,
                omit5: false,
                omit3: false,
                noBarre: false,
                easyOnly: false,
                allowInversions: false,
              })
            }
            className="flex items-center gap-1 text-[10px] text-neutral-400 hover:text-cyan-300"
            title="Resetar filtros"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Padrão</span>
          </button>
        </div>

        {/* Sliders for Span and Up to Fret */}
        <div className="grid grid-cols-2 gap-3">
          {/* Fret Span / Distance Slider */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-neutral-400">Distância (Span):</span>
              <span className="font-mono font-bold text-cyan-300">
                {constraints.maxSpan ?? 4} casas
              </span>
            </div>
            <input
              type="range"
              min={3}
              max={5}
              step={1}
              value={constraints.maxSpan ?? 4}
              onChange={(e) => setConstraints({ maxSpan: parseInt(e.target.value, 10) })}
              className="accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Up to Fret Slider */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-neutral-400">Até a Casa:</span>
              <span className="font-mono font-bold text-cyan-300">
                {constraints.upToFret ?? 15}ª
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={24}
              step={1}
              value={constraints.upToFret ?? 15}
              onChange={(e) => setConstraints({ upToFret: parseInt(e.target.value, 10) })}
              className="accent-cyan-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Toggles Checklist */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
          <label className="flex items-center gap-1.5 cursor-pointer text-neutral-300 hover:text-neutral-100">
            <input
              type="checkbox"
              checked={Boolean(constraints.noBarre)}
              onChange={(e) => setConstraints({ noBarre: e.target.checked })}
              className="rounded border-neutral-700 bg-neutral-900 text-cyan-500 focus:ring-0 accent-cyan-500"
            />
            <span>Sem Pestanas</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-neutral-300 hover:text-neutral-100">
            <input
              type="checkbox"
              checked={Boolean(constraints.easyOnly)}
              onChange={(e) => setConstraints({ easyOnly: e.target.checked })}
              className="rounded border-neutral-700 bg-neutral-900 text-cyan-500 focus:ring-0 accent-cyan-500"
            />
            <span>Easy Chords</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-neutral-300 hover:text-neutral-100">
            <input
              type="checkbox"
              checked={Boolean(constraints.omit5)}
              onChange={(e) => setConstraints({ omit5: e.target.checked })}
              className="rounded border-neutral-700 bg-neutral-900 text-cyan-500 focus:ring-0 accent-cyan-500"
            />
            <span>Omitir 5ª (Omit 5th)</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-neutral-300 hover:text-neutral-100">
            <input
              type="checkbox"
              checked={Boolean(constraints.omit3)}
              onChange={(e) => setConstraints({ omit3: e.target.checked })}
              className="rounded border-neutral-700 bg-neutral-900 text-cyan-500 focus:ring-0 accent-cyan-500"
            />
            <span>Omitir 3ª (Omit 3rd)</span>
          </label>

          <label className="col-span-2 flex items-center gap-1.5 cursor-pointer text-neutral-300 hover:text-neutral-100">
            <input
              type="checkbox"
              checked={Boolean(constraints.allowInversions)}
              onChange={(e) => setConstraints({ allowInversions: e.target.checked })}
              className="rounded border-neutral-700 bg-neutral-900 text-cyan-500 focus:ring-0 accent-cyan-500"
            />
            <span>Permitir Inversões (Slash Chords / Baixo Livre)</span>
          </label>
        </div>
      </div>
    </div>
  );
};
