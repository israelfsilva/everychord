import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../../App';
import { useChordStore } from '../../store/chord-store';
import { LOCALE_STORAGE_KEY, LOCALES, MESSAGES, detectLocale, getInitialLocale, useI18n } from '..';

describe('detectLocale', () => {
  it('maps regional browser languages to a supported locale', () => {
    expect(detectLocale(['pt-BR'])).toBe('pt');
    expect(detectLocale(['es-AR', 'en'])).toBe('es');
    expect(detectLocale(['EN-us'])).toBe('en');
  });

  it('skips unsupported languages and falls back to English', () => {
    expect(detectLocale(['fr-FR', 'es'])).toBe('es');
    expect(detectLocale(['de', 'ja'])).toBe('en');
    expect(detectLocale([])).toBe('en');
  });
});

describe('locale store', () => {
  beforeEach(() => localStorage.clear());

  it('prefers the stored locale over the browser language', () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'es');
    expect(getInitialLocale()).toBe('es');
  });

  it('ignores an invalid stored locale', () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'klingon');
    expect(LOCALES).toContain(getInitialLocale());
  });

  it('persists the choice and updates the document language and title', () => {
    useI18n.getState().setLocale('es');
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('es');
    expect(document.documentElement.lang).toBe('es');
    expect(document.title).toBe(MESSAGES.es.meta.title);
  });
});

describe('language switcher', () => {
  beforeEach(() => {
    localStorage.clear();
    useI18n.getState().setLocale('pt');
    useChordStore.getState().setChordSymbol('C');
  });

  it('switches the whole UI between Portuguese, English and Spanish', () => {
    render(<App />);
    const switcher = screen.getByLabelText('Idioma');

    fireEvent.change(switcher, { target: { value: 'en' } });
    expect(screen.getByRole('heading', { level: 2, name: 'Suffix' })).toBeDefined();
    expect(screen.getByRole('heading', { level: 2, name: 'Neck' })).toBeDefined();
    expect(screen.getByPlaceholderText(/Quick search/)).toBeDefined();
    expect(screen.getByRole('button', { name: 'No barre' })).toBeDefined();

    fireEvent.change(screen.getByLabelText('Language'), { target: { value: 'es' } });
    expect(screen.getByRole('heading', { level: 2, name: 'Sufijo' })).toBeDefined();
    expect(screen.getByRole('heading', { level: 2, name: 'Mástil' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Sin cejilla' })).toBeDefined();
  });

  it('defines every family label for each locale', () => {
    for (const locale of LOCALES) {
      expect(MESSAGES[locale].selector.families).toHaveLength(4);
    }
  });
});
