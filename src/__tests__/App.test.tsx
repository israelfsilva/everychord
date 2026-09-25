import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import { useChordStore } from '../store/chord-store';
import { THEME_STORAGE_KEY } from '../lib/theme';

describe('OpenChords Application Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    useChordStore.getState().setConstraints({ noBarre: false });
  });

  it('renders application header, chord selector, diagram grid and console', () => {
    render(<App />);

    // Header title
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toContain('Open');
    expect(heading.textContent).toContain('Chords');

    // Search bar
    expect(
      screen.getByPlaceholderText(/Busca rápida/i)
    ).toBeDefined();

    // Root note buttons
    expect(screen.getByRole('button', { name: /^C$/ })).toBeDefined();
    expect(screen.getByRole('button', { name: /^G$/ })).toBeDefined();

    // Diagram grid
    expect(screen.getAllByLabelText(/Diagrama de acorde/i).length).toBeGreaterThan(0);

    // Bottom console
    expect(screen.getByRole('heading', { level: 2, name: /^Voicing$/ })).toBeDefined();
    expect(screen.getByRole('heading', { level: 2, name: /^Afinação$/ })).toBeDefined();
    expect(screen.getByRole('heading', { level: 2, name: /^Filtros$/ })).toBeDefined();
  });

  it('updates chord when user clicks a different root and modifier', () => {
    render(<App />);

    // Click root 'A'
    const aButton = screen.getByRole('button', { name: /^A$/ });
    fireEvent.click(aButton);

    // Click category tab 'Menor'
    const menorTab = screen.getByRole('button', { name: /^Menor$/i });
    fireEvent.click(menorTab);

    // Click modifier 'Minor (m)'
    const mButton = screen.getByRole('button', { name: /Minor \(m\)/i });
    fireEvent.click(mButton);

    // Verify active chord indicator displays Am
    expect(screen.getAllByText('Am').length).toBeGreaterThan(0);
  });

  it('updates chord via search bar submission', () => {
    render(<App />);

    const searchInput = screen.getByPlaceholderText(/Busca rápida/i);
    fireEvent.change(searchInput, { target: { value: 'D7' } });

    const submitBtn = screen.getByRole('button', { name: /^Ir$/ });
    fireEvent.click(submitBtn);

    expect(screen.getAllByText('D7').length).toBeGreaterThan(0);
  });

  it('toggles theme on <html> and persists the choice', () => {
    render(<App />);

    // jsdom has no matchMedia and storage is empty: defaults to dark
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    const themeButton = screen.getByRole('button', { name: /Alternar tema/i });
    fireEvent.click(themeButton);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');

    fireEvent.click(themeButton);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('restores a saved light theme on load', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
    render(<App />);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('focuses the quick search with Cmd+K / Ctrl+K', () => {
    render(<App />);
    const searchInput = screen.getByPlaceholderText(/Busca rápida/i);

    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    expect(document.activeElement).toBe(searchInput);

    searchInput.blur();
    fireEvent.keyDown(window, { key: 'K', ctrlKey: true });
    expect(document.activeElement).toBe(searchInput);
  });

  it('updates the no-barre filter through its switch', () => {
    render(<App />);
    const noBarreSwitch = screen.getByRole('switch', { name: /Sem Pestanas/i });

    fireEvent.click(noBarreSwitch);
    expect(useChordStore.getState().constraints.noBarre).toBe(true);

    fireEvent.click(noBarreSwitch);
    expect(useChordStore.getState().constraints.noBarre).toBe(false);
  });
});
