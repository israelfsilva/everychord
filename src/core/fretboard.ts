import { Chord, Note } from '@tonaljs/tonal';
import type { ChordDefinition, Tuning } from './types';

export const STANDARD_GUITAR: Tuning = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];
export const DROP_D: Tuning = ['D2', 'A2', 'D3', 'G3', 'B3', 'E4'];
export const DADGAD: Tuning = ['D2', 'A2', 'D3', 'G3', 'A3', 'D4'];
export const OPEN_G: Tuning = ['D2', 'G2', 'D3', 'G3', 'B3', 'D4'];
export const OPEN_D: Tuning = ['D2', 'A2', 'D3', 'F#3', 'A3', 'D4'];
export const STANDARD_BASS: Tuning = ['E1', 'A1', 'D2', 'G2'];

export interface FretInfo {
  fret: number;
  midi: number;
  note: string;       // e.g. "C3"
  pitchClass: string; // e.g. "C"
  chroma: number;     // 0-11
}

/**
 * Returns MIDI number for a given open string note and fret offset.
 */
export function getFretMidi(openStringNote: string, fret: number): number {
  const baseMidi = Note.midi(openStringNote);
  if (baseMidi === null) {
    throw new Error(`Invalid open string note: ${openStringNote}`);
  }
  return baseMidi + fret;
}

/**
 * Returns detailed pitch information for a given fret on an open string note.
 */
export function getFretNote(openStringNote: string, fret: number): FretInfo {
  const midi = getFretMidi(openStringNote, fret);
  const note = Note.fromMidi(midi);
  const pitchClass = Note.pitchClass(note);
  const chroma = Note.chroma(pitchClass) ?? 0;

  return {
    fret,
    midi,
    note,
    pitchClass,
    chroma,
  };
}

/**
 * Parses and returns pitch set, chromas and intervals for a chord symbol (e.g. "C", "Am", "G7").
 */
export function getChordDefinition(symbol: string): ChordDefinition {
  const chord = Chord.get(symbol);
  if (chord.empty) {
    throw new Error(`Unknown or invalid chord symbol: ${symbol}`);
  }

  const chromas = chord.notes.map((n) => Note.chroma(n) ?? 0);

  return {
    symbol,
    tonic: chord.tonic || chord.notes[0],
    type: chord.type,
    notes: chord.notes,
    chromas,
    intervals: chord.intervals,
  };
}

/**
 * Converts array of frets to standard tab string.
 * Example: [-1, 3, 2, 0, 1, 0] -> "X32010"
 * Frets >= 10 are formatted as "(10)" to avoid ambiguity.
 */
export function fretsToTab(frets: number[]): string {
  return frets
    .map((f) => {
      if (f === -1) return 'X';
      if (f >= 10) return `(${f})`;
      return f.toString();
    })
    .join('');
}

/**
 * Parses tab string to array of frets.
 * Example: "X32010" -> [-1, 3, 2, 0, 1, 0]
 * Example: "X-X-(10)-8-8-8" or "XX(10)888" -> [-1, -1, 10, 8, 8, 8]
 */
export function tabToFrets(tabString: string): number[] {
  const result: number[] = [];
  const clean = tabString.replace(/-/g, '').trim();
  let i = 0;

  while (i < clean.length) {
    const char = clean[i];
    if (char === 'X' || char === 'x') {
      result.push(-1);
      i++;
    } else if (char === '(') {
      const closeIdx = clean.indexOf(')', i);
      if (closeIdx === -1) {
        throw new Error(`Malformed tab string, missing closing parenthesis in ${tabString}`);
      }
      const numStr = clean.slice(i + 1, closeIdx);
      result.push(parseInt(numStr, 10));
      i = closeIdx + 1;
    } else if (/\d/.test(char)) {
      result.push(parseInt(char, 10));
      i++;
    } else {
      i++;
    }
  }

  return result;
}

export interface VoicingNotesAnalysis {
  soundingNotes: string[];
  soundingMidis: number[];
  pitchClasses: string[];
  chromas: number[];
  bassNote: string;
  bassChroma: number;
  isMutedAll: boolean;
}

/**
 * Analyzes sounding notes for an array of frets against a tuning.
 */
export function analyzeVoicingNotes(frets: number[], tuning: Tuning): VoicingNotesAnalysis {
  const soundingNotes: string[] = [];
  const soundingMidis: number[] = [];
  const pitchClassesSet = new Set<string>();
  const chromasSet = new Set<number>();
  let bassNote = '';
  let bassChroma = -1;

  for (let i = 0; i < frets.length; i++) {
    const fret = frets[i];
    if (fret < 0) continue; // Muted

    const info = getFretNote(tuning[i], fret);
    soundingNotes.push(info.note);
    soundingMidis.push(info.midi);
    pitchClassesSet.add(info.pitchClass);
    chromasSet.add(info.chroma);

    if (!bassNote) {
      bassNote = info.pitchClass;
      bassChroma = info.chroma;
    }
  }

  return {
    soundingNotes,
    soundingMidis,
    pitchClasses: Array.from(pitchClassesSet),
    chromas: Array.from(chromasSet),
    bassNote,
    bassChroma,
    isMutedAll: soundingNotes.length === 0,
  };
}
