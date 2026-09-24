import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import {
  CHORD_ROOTS,
  MODIFIER_GROUPS,
  useChordStore,
} from '../store/chord-store';

export const ChordSelector: React.FC = () => {
  const {
    root,
    modifier,
    chordSymbol,
    setRoot,
    setModifier,
    setChordSymbol,
  } = useChordStore();

  const [searchInput, setSearchInput] = useState('');
  const [selectedCategoryIdx, setSelectedCategoryIdx] = useState(0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setChordSymbol(searchInput.trim());
      setSearchInput('');
    }
  };

  return (
    <div className="flex h-full w-full flex-col gap-3 border-r border-neutral-800 bg-neutral-950/70 p-3 select-none">
      {/* Quick Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative w-full">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Busca rápida (ex: F#m7, Bb9, Ddim)..."
          className="h-9 w-full rounded-lg border border-neutral-800 bg-neutral-900/90 pl-8 pr-3 text-xs text-neutral-200 placeholder-neutral-500 transition-colors focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
        />
        {searchInput && (
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 rounded bg-cyan-600 px-2 py-1 text-[10px] font-semibold text-white hover:bg-cyan-500"
          >
            Ir
          </button>
        )}
      </form>

      {/* Root Note Selector */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
            Fundamental (Root)
          </span>
          <span className="font-mono text-xs font-bold text-cyan-400">{root}</span>
        </div>
        <div className="grid grid-cols-4 gap-1 sm:grid-cols-6 lg:grid-cols-4">
          {CHORD_ROOTS.map((r) => {
            const isActive = root === r;
            return (
              <button
                key={`root-${r}`}
                type="button"
                onClick={() => setRoot(r)}
                className={`flex h-7 items-center justify-center rounded border font-mono text-xs font-bold transition-all ${
                  isActive
                    ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 shadow-sm shadow-cyan-500/30'
                    : 'border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800'
                }`}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-neutral-800/80" />

      {/* Modifiers Categories & Selector */}
      <div className="flex flex-1 flex-col gap-2 overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
            Qualidade / Modificador
          </span>
          <span className="font-mono text-xs font-bold text-cyan-400">
            {modifier || 'M'}
          </span>
        </div>

        {/* Category Tabs */}
        <div className="grid grid-cols-2 gap-1 rounded-lg border border-neutral-800/80 bg-neutral-900/50 p-1">
          {MODIFIER_GROUPS.map((group, idx) => {
            const isTabActive = selectedCategoryIdx === idx;
            return (
              <button
                key={`group-tab-${group.category}`}
                type="button"
                onClick={() => setSelectedCategoryIdx(idx)}
                className={`truncate rounded px-2 py-1 text-[11px] font-medium transition-all ${
                  isTabActive
                    ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {group.category.split(' ')[0]}
              </button>
            );
          })}
        </div>

        {/* Modifier Buttons Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-1.5">
            {MODIFIER_GROUPS[selectedCategoryIdx].modifiers.map((mod) => {
              const isModActive = modifier === mod.value;
              return (
                <button
                  key={`mod-${mod.value}`}
                  type="button"
                  onClick={() => setModifier(mod.value)}
                  className={`flex h-8 items-center justify-between rounded-lg border px-2.5 font-mono text-xs font-semibold transition-all ${
                    isModActive
                      ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 shadow-sm shadow-cyan-500/20'
                      : 'border-neutral-800/80 bg-neutral-900/40 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800'
                  }`}
                >
                  <span className="truncate">{mod.label}</span>
                  {isModActive && <Sparkles className="h-3 w-3 shrink-0 text-cyan-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Full Symbol Badge */}
        <div className="mt-auto flex items-center justify-between rounded-lg border border-cyan-500/30 bg-cyan-950/20 px-3 py-2">
          <span className="text-[11px] text-neutral-400">Cifra Montada:</span>
          <span className="font-mono text-sm font-extrabold text-cyan-300">
            {chordSymbol}
          </span>
        </div>
      </div>
    </div>
  );
};
