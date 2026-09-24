import { describe, it, expect } from 'vitest';
import {
  STANDARD_GUITAR,
  STANDARD_BASS,
  getFretMidi,
  getFretNote,
  getChordDefinition,
  fretsToTab,
  tabToFrets,
  analyzeVoicingNotes,
} from '../fretboard';

describe('Fretboard & Music Theory Utils', () => {
  it('calculates correct MIDI numbers and note names on frets', () => {
    // E2 open (fret 0) is MIDI 40
    expect(getFretMidi('E2', 0)).toBe(40);
    expect(getFretNote('E2', 0).note).toBe('E2');
    expect(getFretNote('E2', 0).chroma).toBe(4); // E is chroma 4

    // E2 fret 1 is F2 (MIDI 41)
    expect(getFretMidi('E2', 1)).toBe(41);
    expect(getFretNote('E2', 1).note).toBe('F2');
    expect(getFretNote('E2', 1).chroma).toBe(5);

    // A2 fret 2 is B2 (MIDI 47)
    expect(getFretMidi('A2', 2)).toBe(47);
    expect(getFretNote('A2', 2).note).toBe('B2');

    // D3 fret 2 is E3 (MIDI 52)
    expect(getFretMidi('D3', 2)).toBe(52);
    expect(getFretNote('D3', 2).note).toBe('E3');
    expect(getFretNote('D3', 2).chroma).toBe(4);
  });

  it('works with bass tuning', () => {
    expect(getFretMidi(STANDARD_BASS[0], 0)).toBe(28);
    expect(getFretNote(STANDARD_BASS[0], 0).note).toBe('E1');
    expect(getFretNote(STANDARD_BASS[0], 5).note).toBe('A1');
  });

  it('extracts pitch set, chromas and intervals for standard chords', () => {
    const cMajor = getChordDefinition('C');
    expect(cMajor.tonic).toBe('C');
    expect(cMajor.notes).toEqual(['C', 'E', 'G']);
    expect(cMajor.chromas).toEqual([0, 4, 7]);

    const cMinor = getChordDefinition('Cm');
    expect(cMinor.tonic).toBe('C');
    expect(cMinor.notes).toEqual(['C', 'Eb', 'G']);
    expect(cMinor.chromas).toEqual([0, 3, 7]);

    const aMinor = getChordDefinition('Am');
    expect(aMinor.tonic).toBe('A');
    expect(aMinor.notes).toEqual(['A', 'C', 'E']);
  });

  it('converts frets to tab string and back', () => {
    expect(fretsToTab([-1, 3, 2, 0, 1, 0])).toBe('X32010');
    expect(tabToFrets('X32010')).toEqual([-1, 3, 2, 0, 1, 0]);

    expect(fretsToTab([-1, -1, 2, 0, 4, 3])).toBe('XX2043');
    expect(tabToFrets('XX2043')).toEqual([-1, -1, 2, 0, 4, 3]);

    expect(fretsToTab([1, 3, 3, 2, 1, 1])).toBe('133211');
    expect(tabToFrets('133211')).toEqual([1, 3, 3, 2, 1, 1]);
  });

  it('analyzes sounding notes and pitch classes of a voicing', () => {
    // C major open chord: X32010 on standard guitar
    const analysis = analyzeVoicingNotes([-1, 3, 2, 0, 1, 0], STANDARD_GUITAR);
    expect(analysis.soundingNotes).toEqual(['C3', 'E3', 'G3', 'C4', 'E4']);
    expect(analysis.pitchClasses).toEqual(['C', 'E', 'G']);
    expect(analysis.bassNote).toBe('C');
    expect(analysis.isMutedAll).toBe(false);

    // XX2043 on standard guitar
    const xx2043 = analyzeVoicingNotes([-1, -1, 2, 0, 4, 3], STANDARD_GUITAR);
    expect(xx2043.soundingNotes).toEqual(['E3', 'G3', 'Eb4', 'G4']);
    expect(xx2043.pitchClasses).toEqual(['E', 'G', 'Eb']);
    expect(xx2043.bassNote).toBe('E');
  });
});
