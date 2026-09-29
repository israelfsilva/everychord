import React, { useEffect, useRef, useState } from 'react';
import { Volume2, Hand, Search, Sun, Moon, Menu, X } from 'lucide-react';
import { useChordStore } from '../store/chord-store';
import { soundEngine } from '../audio/sound-engine';
import { applyTheme, getInitialTheme, saveTheme, type Theme } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { LogoMark } from './LogoMark';

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

const iconButtonClass =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-oc border border-line text-muted transition-colors duration-120 hover:border-muted hover:text-text';

export const HeaderBar: React.FC<{ onMenuClick?: () => void }> = ({ onMenuClick }) => {
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
  // Below md the search collapses to an icon; this opens it over the header
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // ⌘K / Ctrl+K focuses the quick search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // The input is display:none until the overlay renders, so focus after opening
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    saveTheme(next);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchInput('');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setChordSymbol(searchInput.trim());
      closeSearch();
      searchRef.current?.blur();
    }
  };

  const handlePlaySelected = () => {
    if (selectedVoicing) {
      soundEngine.strumChord(selectedVoicing);
    }
  };

  return (
    <header className="relative flex h-[60px] w-full items-center gap-2 border-b border-line bg-surface px-(--pad) sm:gap-3.5">
      {/* Drawer toggle (mobile) */}
      <button
        type="button"
        onClick={onMenuClick}
        className={cn(iconButtonClass, 'lg:hidden')}
        aria-label="Abrir seleção de acorde"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Brand + breadcrumb: the chord symbol never shrinks away */}
      <div className="flex min-w-0 items-center gap-3.5">
        <div className="hidden h-[34px] w-[34px] shrink-0 items-center justify-center rounded-oc bg-accent text-on-accent sm:flex">
          <LogoMark className="h-6 w-6" />
        </div>
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2.5 text-sm">
          <h1 className="sr-only text-muted md:not-sr-only">OpenChords</h1>
          <span className="hidden text-faint md:inline" aria-hidden>›</span>
          <span
            className="max-w-[9ch] shrink-0 truncate font-mono font-medium text-accent sm:max-w-[12ch]"
            aria-current="page"
            title={chordSymbol}
          >
            {chordSymbol}
          </span>
        </nav>
      </div>

      <span className="flex-1" />

      {/* Search trigger (below md) */}
      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        className={cn(iconButtonClass, 'md:hidden')}
        aria-label="Abrir busca"
      >
        <Search className="h-4 w-4" />
      </button>

      {/* Quick search: inline from md, full-header overlay below */}
      <form
        onSubmit={handleSearchSubmit}
        onKeyDown={(e) => e.key === 'Escape' && closeSearch()}
        className={cn(
          'md:static md:z-auto md:flex md:w-[290px] md:shrink md:bg-transparent md:p-0',
          searchOpen
            ? 'absolute inset-0 z-20 flex items-center gap-2 bg-surface px-(--pad)'
            : 'hidden'
        )}
      >
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <input
            ref={searchRef}
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Busca rápida (ex: F#m7, Bb9)"
            className="h-9 w-full rounded-oc border border-line bg-bg pl-8 pr-10 text-[13px] lg:pr-16 text-text placeholder:text-muted transition-colors duration-120 hover:border-muted focus:border-accent focus:outline-none"
          />
          {searchInput ? (
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-chip bg-accent px-2 py-0.5 text-xs font-semibold text-on-accent hover:brightness-110"
            >
              Ir
            </button>
          ) : (
            <span className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 items-center gap-1 lg:flex">
              <kbd className="rounded-[3px] border border-line px-[5px] py-px font-mono text-[10px] text-muted">
                {isMac ? '⌘' : 'Ctrl'}
              </kbd>
              <kbd className="rounded-[3px] border border-line px-[5px] py-px font-mono text-[10px] text-muted">
                K
              </kbd>
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={closeSearch}
          className={cn(iconButtonClass, 'md:hidden')}
          aria-label="Fechar busca"
        >
          <X className="h-4 w-4" />
        </button>
      </form>

      {/* Left-Hand Toggle */}
      <button
        type="button"
        onClick={() => setIsLeftHanded(!isLeftHanded)}
        aria-pressed={isLeftHanded}
        className={cn(
          iconButtonClass,
          isLeftHanded && 'border-accent bg-accent-soft text-accent hover:border-accent hover:text-accent'
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

      {/* Play Current Voicing Button (icon-only below sm) */}
      <button
        type="button"
        onClick={handlePlaySelected}
        disabled={!selectedVoicing || isPlaying}
        className="flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-oc bg-accent text-sm font-semibold text-on-accent transition-[filter,transform] duration-120 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-4"
        title="Dedilhar acorde selecionado (strumming)"
        aria-label="Dedilhar Acorde"
      >
        <Volume2 className={cn('h-4 w-4', isPlaying && 'animate-bounce')} />
        <span className="hidden sm:inline">Dedilhar</span>
      </button>
    </header>
  );
};
