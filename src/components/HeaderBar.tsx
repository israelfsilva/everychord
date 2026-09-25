import React, { useEffect, useRef, useState } from 'react';
import { Volume2, Music, Hand, Search, Sun, Moon, ChevronRight } from 'lucide-react';
import { useChordStore } from '../store/chord-store';
import { soundEngine } from '../audio/sound-engine';
import { applyTheme, getInitialTheme, saveTheme, type Theme } from '@/lib/theme';
import { cn } from '@/lib/utils';

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

const iconButtonClass =
  'flex h-9 w-9 items-center justify-center rounded-md surface-raised text-muted-foreground transition-colors hover:bg-accent hover:text-foreground';

export const HeaderBar: React.FC = () => {
  const {
    chordSymbol,
    selectedVoicing,
    isLeftHanded,
    isPlaying,
    setIsLeftHanded,
    setChordSymbol,
  } = useChordStore();

  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [searchInput, setSearchInput] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // ⌘K / Ctrl+K focuses the quick search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    saveTheme(next);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setChordSymbol(searchInput.trim());
      setSearchInput('');
    }
  };

  const handlePlaySelected = () => {
    if (selectedVoicing) {
      soundEngine.strumChord(selectedVoicing);
    }
  };

  return (
    <header className="flex h-16 w-full shrink-0 items-center justify-between gap-4 border-b bg-background px-4">
      {/* Brand + breadcrumb */}
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md surface-primary">
          <Music className="h-5 w-5" />
        </div>
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
          <h1 className="font-medium text-muted-foreground">OpenChords</h1>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60" />
          <span className="truncate font-mono font-semibold text-primary-text" aria-current="page">
            {chordSymbol}
          </span>
        </nav>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {/* Quick search */}
        <form onSubmit={handleSearchSubmit} className="relative w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={searchRef}
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Busca rápida (ex: F#m7, Bb9)"
            className="h-9 w-full rounded-md surface-well pl-9 pr-16 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {searchInput ? (
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md surface-primary px-2 py-0.5 text-xs font-medium hover:brightness-110"
            >
              Ir
            </button>
          ) : (
            <span className="pointer-events-none absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
              <kbd className="rounded-sm border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
                {isMac ? '⌘' : 'Ctrl'}
              </kbd>
              <kbd className="rounded-sm border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
                K
              </kbd>
            </span>
          )}
        </form>

        {/* Left-Hand Toggle */}
        <button
          type="button"
          onClick={() => setIsLeftHanded(!isLeftHanded)}
          aria-pressed={isLeftHanded}
          className={cn(
            iconButtonClass,
            isLeftHanded && 'border-primary/50! bg-primary/10! text-primary-text hover:text-primary-text'
          )}
          title="Modo canhoto (inverte a ordem das cordas no diagrama)"
          aria-label="Modo Canhoto"
        >
          <Hand className="h-4 w-4" />
        </button>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className={iconButtonClass}
          title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
          aria-label="Alternar tema"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Play Current Voicing Button */}
        <button
          type="button"
          onClick={handlePlaySelected}
          disabled={!selectedVoicing || isPlaying}
          className="flex h-9 items-center gap-2 rounded-md surface-primary px-4 text-sm font-medium transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          title="Dedilhar acorde selecionado (strumming)"
          aria-label="Dedilhar Acorde"
        >
          <Volume2 className={cn('h-4 w-4', isPlaying && 'animate-bounce')} />
          <span>Dedilhar</span>
        </button>
      </div>
    </header>
  );
};
