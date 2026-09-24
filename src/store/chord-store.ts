import { create } from 'zustand';
import { Chord, Note } from '@tonaljs/tonal';
import { solveChords } from '../core/chord-solver';
import {
  DADGAD,
  DROP_D,
  OPEN_D,
  OPEN_G,
  STANDARD_BASS,
  STANDARD_GUITAR,
  getChordDefinition,
} from '../core/fretboard';
import type { ChordVoicing, SearchConstraints, Tuning } from '../core/types';
import { LruCache } from './lru-cache';

export interface TuningPreset {
  id: string;
  name: string;
  tuning: Tuning;
}

export const TUNING_PRESETS: Record<string, TuningPreset> = {
  standard: {
    id: 'standard',
    name: 'Standard (E-A-D-G-B-E)',
    tuning: STANDARD_GUITAR,
  },
  dropD: {
    id: 'dropD',
    name: 'Drop D (D-A-D-G-B-E)',
    tuning: DROP_D,
  },
  dadgad: {
    id: 'dadgad',
    name: 'DADGAD (D-A-D-G-A-D)',
    tuning: DADGAD,
  },
  openG: {
    id: 'openG',
    name: 'Open G (D-G-D-G-B-D)',
    tuning: OPEN_G,
  },
  openD: {
    id: 'openD',
    name: 'Open D (D-A-D-F#-A-D)',
    tuning: OPEN_D,
  },
  bass4: {
    id: 'bass4',
    name: 'Bass 4-Cordas (E-A-D-G)',
    tuning: STANDARD_BASS,
  },
};

export const CHORD_ROOTS = [
  'C',
  'C#',
  'Db',
  'D',
  'D#',
  'Eb',
  'E',
  'F',
  'F#',
  'Gb',
  'G',
  'G#',
  'Ab',
  'A',
  'A#',
  'Bb',
  'B',
];

export interface ModifierGroup {
  category: string;
  modifiers: { label: string; value: string }[];
}

export const MODIFIER_GROUPS: ModifierGroup[] = [
  {
    category: 'Maior (Major)',
    modifiers: [
      { label: 'Major', value: '' },
      { label: 'maj7', value: 'maj7' },
      { label: '6', value: '6' },
      { label: 'add9', value: 'add9' },
      { label: 'maj9', value: 'maj9' },
      { label: '6/9', value: '6/9' },
      { label: 'maj13', value: 'maj13' },
    ],
  },
  {
    category: 'Menor (Minor)',
    modifiers: [
      { label: 'Minor (m)', value: 'm' },
      { label: 'm7', value: 'm7' },
      { label: 'm6', value: 'm6' },
      { label: 'm9', value: 'm9' },
      { label: 'm11', value: 'm11' },
      { label: 'm(maj7)', value: 'm(maj7)' },
      { label: 'madd9', value: 'madd9' },
      { label: 'm7b5', value: 'm7b5' },
    ],
  },
  {
    category: 'Dominante',
    modifiers: [
      { label: '7', value: '7' },
      { label: '9', value: '9' },
      { label: '11', value: '11' },
      { label: '13', value: '13' },
      { label: '7sus4', value: '7sus4' },
      { label: '7b5', value: '7b5' },
      { label: '7#5', value: '7#5' },
      { label: '7b9', value: '7b9' },
      { label: '7#9', value: '7#9' },
    ],
  },
  {
    category: 'Sus / Dim / Alt',
    modifiers: [
      { label: 'sus2', value: 'sus2' },
      { label: 'sus4', value: 'sus4' },
      { label: 'dim', value: 'dim' },
      { label: 'dim7', value: 'dim7' },
      { label: 'aug', value: 'aug' },
      { label: '5 (Power Chord)', value: '5' },
    ],
  },
];

/**
 * Parses user input string like "F#m7", "bbmaj7", "c" into root and modifier.
 */
export function parseChordInput(input: string): { root: string; modifier: string } {
  const trimmed = input.trim();
  const match = trimmed.match(/^([a-gA-G][#b]?)(.*)$/);
  if (!match) {
    return { root: 'C', modifier: '' };
  }

  const rawRoot = match[1];
  const root = rawRoot.charAt(0).toUpperCase() + rawRoot.slice(1).toLowerCase();
  const modifier = match[2].trim();

  return { root, modifier };
}

/**
 * Returns enharmonic and alternative chord names sharing the same pitch set.
 */
export function calculateEquivalentChords(
  root: string,
  modifier: string,
  chordSymbol: string
): string[] {
  const equivalents = new Set<string>();

  // 1. Enharmonic root (e.g. C#m -> Dbm)
  const enharmonicRoot = Note.enharmonic(root);
  if (enharmonicRoot && enharmonicRoot !== root) {
    equivalents.add(`${enharmonicRoot}${modifier}`);
  }

  // 2. Pitch set equivalent detection
  try {
    const chordDef = getChordDefinition(chordSymbol);
    const detected = Chord.detect(chordDef.notes);
    for (const d of detected) {
      if (d !== chordSymbol && !d.includes('/')) {
        equivalents.add(d);
      }
    }
  } catch {
    // Ignore invalid chords
  }

  return Array.from(equivalents);
}

// Global LRU cache for 60fps instant recalculations
const chordCache = new LruCache<string, ChordVoicing[]>(64);

export interface ChordState {
  root: string;
  modifier: string;
  chordSymbol: string;
  searchQuery: string;

  tuningPreset: string;
  tuning: Tuning;

  constraints: SearchConstraints;
  isLeftHanded: boolean;

  voicings: ChordVoicing[];
  selectedVoicingId: string | null;
  selectedVoicing: ChordVoicing | null;
  equivalentChords: string[];

  isPlaying: boolean;
  activeStringIndex: number | null;

  // Actions
  setRoot: (root: string) => void;
  setModifier: (modifier: string) => void;
  setChordSymbol: (symbol: string) => void;
  setSearchQuery: (query: string) => void;
  setTuningPreset: (presetKey: string) => void;
  setStringTuning: (stringIndex: number, note: string) => void;
  setConstraints: (partial: Partial<SearchConstraints>) => void;
  setIsLeftHanded: (leftHanded: boolean) => void;
  selectVoicing: (voicingId: string) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setActiveStringIndex: (idx: number | null) => void;
  recalculateVoicings: () => void;
}

function computeVoicingsWithCache(
  chordSymbol: string,
  tuning: Tuning,
  constraints: SearchConstraints
): ChordVoicing[] {
  const cacheKey = `${chordSymbol}|${tuning.join(',')}|${JSON.stringify(constraints)}`;
  const cached = chordCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const results = solveChords(chordSymbol, tuning, constraints);
    chordCache.set(cacheKey, results);
    return results;
  } catch (err) {
    console.error(`Error solving chords for ${chordSymbol}:`, err);
    return [];
  }
}

const defaultConstraints: SearchConstraints = {
  maxSpan: 4,
  upToFret: 15,
  omit5: false,
  omit3: false,
  noBarre: false,
  easyOnly: false,
  allowInversions: false,
  allowThumb: false,
};

const initialRoot = 'C';
const initialModifier = '';
const initialSymbol = 'C';
const initialTuning = STANDARD_GUITAR;

const initialVoicings = computeVoicingsWithCache(
  initialSymbol,
  initialTuning,
  defaultConstraints
);

const initialSelectedVoicing =
  initialVoicings.find((v) => v.tabString === 'X32010') ||
  initialVoicings[0] ||
  null;

export const useChordStore = create<ChordState>((set, get) => ({
  root: initialRoot,
  modifier: initialModifier,
  chordSymbol: initialSymbol,
  searchQuery: '',

  tuningPreset: 'standard',
  tuning: initialTuning,

  constraints: defaultConstraints,
  isLeftHanded: false,

  voicings: initialVoicings,
  selectedVoicingId: initialSelectedVoicing ? initialSelectedVoicing.id : null,
  selectedVoicing: initialSelectedVoicing,
  equivalentChords: calculateEquivalentChords(
    initialRoot,
    initialModifier,
    initialSymbol
  ),

  isPlaying: false,
  activeStringIndex: null,

  setRoot: (root: string) => {
    const { modifier, tuning, constraints } = get();
    const chordSymbol = `${root}${modifier}`;
    const voicings = computeVoicingsWithCache(chordSymbol, tuning, constraints);
    const selectedVoicing = voicings[0] || null;
    const equivalentChords = calculateEquivalentChords(root, modifier, chordSymbol);

    set({
      root,
      chordSymbol,
      voicings,
      selectedVoicingId: selectedVoicing ? selectedVoicing.id : null,
      selectedVoicing,
      equivalentChords,
    });
  },

  setModifier: (modifier: string) => {
    const { root, tuning, constraints } = get();
    const chordSymbol = `${root}${modifier}`;
    const voicings = computeVoicingsWithCache(chordSymbol, tuning, constraints);
    const selectedVoicing = voicings[0] || null;
    const equivalentChords = calculateEquivalentChords(root, modifier, chordSymbol);

    set({
      modifier,
      chordSymbol,
      voicings,
      selectedVoicingId: selectedVoicing ? selectedVoicing.id : null,
      selectedVoicing,
      equivalentChords,
    });
  },

  setChordSymbol: (rawInput: string) => {
    const { root, modifier } = parseChordInput(rawInput);
    const { tuning, constraints } = get();
    const chordSymbol = `${root}${modifier}`;
    const voicings = computeVoicingsWithCache(chordSymbol, tuning, constraints);
    const selectedVoicing = voicings[0] || null;
    const equivalentChords = calculateEquivalentChords(root, modifier, chordSymbol);

    set({
      root,
      modifier,
      chordSymbol,
      searchQuery: rawInput,
      voicings,
      selectedVoicingId: selectedVoicing ? selectedVoicing.id : null,
      selectedVoicing,
      equivalentChords,
    });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  setTuningPreset: (presetKey: string) => {
    const preset = TUNING_PRESETS[presetKey];
    if (!preset) return;

    const { chordSymbol, constraints } = get();
    const voicings = computeVoicingsWithCache(chordSymbol, preset.tuning, constraints);
    const selectedVoicing = voicings[0] || null;

    set({
      tuningPreset: presetKey,
      tuning: preset.tuning,
      voicings,
      selectedVoicingId: selectedVoicing ? selectedVoicing.id : null,
      selectedVoicing,
    });
  },

  setStringTuning: (stringIndex: number, note: string) => {
    const { tuning, chordSymbol, constraints } = get();
    const nextTuning = [...tuning];
    nextTuning[stringIndex] = note;

    const voicings = computeVoicingsWithCache(chordSymbol, nextTuning, constraints);
    const selectedVoicing = voicings[0] || null;

    set({
      tuningPreset: 'custom',
      tuning: nextTuning,
      voicings,
      selectedVoicingId: selectedVoicing ? selectedVoicing.id : null,
      selectedVoicing,
    });
  },

  setConstraints: (partial: Partial<SearchConstraints>) => {
    const nextConstraints = { ...get().constraints, ...partial };
    const { chordSymbol, tuning } = get();
    const voicings = computeVoicingsWithCache(chordSymbol, tuning, nextConstraints);
    const selectedVoicing = voicings[0] || null;

    set({
      constraints: nextConstraints,
      voicings,
      selectedVoicingId: selectedVoicing ? selectedVoicing.id : null,
      selectedVoicing,
    });
  },

  setIsLeftHanded: (isLeftHanded: boolean) => {
    set({ isLeftHanded });
  },

  selectVoicing: (voicingId: string) => {
    const voicing = get().voicings.find((v) => v.id === voicingId) || null;
    set({
      selectedVoicingId: voicingId,
      selectedVoicing: voicing,
    });
  },

  setIsPlaying: (isPlaying: boolean) => {
    set({ isPlaying });
  },

  setActiveStringIndex: (activeStringIndex: number | null) => {
    set({ activeStringIndex });
  },

  recalculateVoicings: () => {
    const { chordSymbol, tuning, constraints } = get();
    const voicings = computeVoicingsWithCache(chordSymbol, tuning, constraints);
    const selectedVoicing = voicings[0] || null;

    set({
      voicings,
      selectedVoicingId: selectedVoicing ? selectedVoicing.id : null,
      selectedVoicing,
    });
  },
}));
