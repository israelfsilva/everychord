import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import { useChordStore } from '../store/chord-store';
import { THEME_STORAGE_KEY } from '../lib/theme';
import { useI18n } from '../i18n';

describe('OpenChords Application Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    useI18n.getState().setLocale('pt');
    document.documentElement.classList.remove('dark');
    useChordStore.getState().setConstraints({ noBarre: false });
    useChordStore.getState().setChordSymbol('C');
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

    // Sidebar sections and the neck panel
    expect(screen.getByRole('heading', { level: 2, name: /^Sufixo$/ })).toBeDefined();
    expect(screen.getByRole('heading', { level: 2, name: /^Voicing$/ })).toBeDefined();
    expect(screen.getByRole('heading', { level: 2, name: /^Braço$/ })).toBeDefined();
    expect(screen.getByLabelText(/Preset de afinação/i)).toBeDefined();
  });

  it('shows the selected voicing on the neck and updates it on selection', () => {
    const countSounding = () =>
      useChordStore.getState().selectedVoicing!.frets.filter((f) => f >= 0).length;
    render(<App />);
    expect(screen.getAllByRole('button', { name: /\(voicing\)$/ }).length).toBe(countSounding());

    const cards = screen.getAllByTestId('chord-diagram-card');
    const other = cards.find((c) => c.getAttribute('aria-pressed') === 'false')!;
    fireEvent.click(other);
    expect(other.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getAllByRole('button', { name: /\(voicing\)$/ }).length).toBe(countSounding());
  });

  it('keeps the suffix family in sync with a searched chord', () => {
    render(<App />);
    const searchInput = screen.getByPlaceholderText(/Busca rápida/i);
    fireEvent.change(searchInput, { target: { value: 'G7' } });
    fireEvent.click(screen.getByRole('button', { name: /^Ir$/ }));

    expect(screen.getByRole('button', { name: /^Dom$/ }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: /^7\s?G7$/ }).getAttribute('aria-pressed')).toBe('true');
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

  it('opens the collapsed mobile search and focuses it', () => {
    render(<App />);
    const searchInput = screen.getByPlaceholderText(/Busca rápida/i);

    fireEvent.click(screen.getByRole('button', { name: /Abrir busca/i }));
    expect(document.activeElement).toBe(searchInput);
    expect(screen.getByRole('button', { name: /Fechar busca/i })).toBeDefined();

    fireEvent.change(searchInput, { target: { value: 'Em' } });
    fireEvent.keyDown(searchInput, { key: 'Escape' });
    expect((searchInput as HTMLInputElement).value).toBe('');
  });

  it('keeps the left-hand toggle available in the header', () => {
    render(<App />);
    const lefty = screen.getByRole('button', { name: /Modo Canhoto/i });
    expect(lefty.className).not.toMatch(/(^|\s)hidden(\s|$)/);
  });

  it('updates the no-barre filter through its chip', () => {
    render(<App />);
    const noBarreChip = screen.getByRole('button', { name: /^Sem pestanas$/i });

    fireEvent.click(noBarreChip);
    expect(useChordStore.getState().constraints.noBarre).toBe(true);
    expect(noBarreChip.getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(noBarreChip);
    expect(useChordStore.getState().constraints.noBarre).toBe(false);
  });

  it('retunes a single string from the neck labels', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText(/Afinação da 6ª corda/i), { target: { value: 'D2' } });
    expect(useChordStore.getState().tuning[0]).toBe('D2');
    expect(useChordStore.getState().tuningPreset).toBe('custom');
    useChordStore.getState().setTuningPreset('standard');
  });
});
