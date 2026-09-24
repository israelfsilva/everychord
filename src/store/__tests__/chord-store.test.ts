import { describe, it, expect, beforeEach } from 'vitest';
import { useChordStore, parseChordInput } from '../chord-store';
import { STANDARD_GUITAR, STANDARD_BASS } from '../../core/fretboard';

describe('Chord Store (Zustand Reativo)', () => {
  beforeEach(() => {
    // Reset to initial state before each test
    useChordStore.getState().setRoot('C');
    useChordStore.getState().setModifier('');
    useChordStore.getState().setTuningPreset('standard');
    useChordStore.getState().setConstraints({
      maxSpan: 4,
      upToFret: 15,
      omit5: false,
      omit3: false,
      noBarre: false,
      easyOnly: false,
      allowInversions: false,
    });
    useChordStore.getState().setIsLeftHanded(false);
  });

  it('initializes with default C major chord and standard tuning', () => {
    const state = useChordStore.getState();
    expect(state.root).toBe('C');
    expect(state.modifier).toBe('');
    expect(state.chordSymbol).toBe('C');
    expect(state.tuning).toEqual(STANDARD_GUITAR);
    expect(state.voicings.length).toBeGreaterThan(0);
    expect(state.selectedVoicing).toBeDefined();
    expect(state.voicings.some((v) => v.tabString === 'X32010')).toBe(true);
  });

  it('updates root and recalculates voicings', () => {
    useChordStore.getState().setRoot('G');
    const state = useChordStore.getState();

    expect(state.root).toBe('G');
    expect(state.chordSymbol).toBe('G');
    expect(state.voicings.length).toBeGreaterThan(0);
    // All voicings should have root G
    for (const v of state.voicings) {
      expect(v.rootNote).toBe('G');
    }
  });

  it('updates modifier to minor and recalculates voicings', () => {
    useChordStore.getState().setModifier('m');
    const state = useChordStore.getState();

    expect(state.modifier).toBe('m');
    expect(state.chordSymbol).toBe('Cm');
    expect(state.voicings.length).toBeGreaterThan(0);
    for (const v of state.voicings) {
      expect(v.rootNote).toBe('C');
      expect(v.pitchClasses).toContain('Eb');
    }
  });

  it('parses user typed chord symbol into root and modifier', () => {
    expect(parseChordInput('F#m7')).toEqual({ root: 'F#', modifier: 'm7' });
    expect(parseChordInput('Bbmaj7')).toEqual({ root: 'Bb', modifier: 'maj7' });
    expect(parseChordInput('C')).toEqual({ root: 'C', modifier: '' });
    expect(parseChordInput('Am')).toEqual({ root: 'A', modifier: 'm' });

    useChordStore.getState().setChordSymbol('D7');
    const state = useChordStore.getState();
    expect(state.root).toBe('D');
    expect(state.modifier).toBe('7');
    expect(state.chordSymbol).toBe('D7');
  });

  it('switches tuning presets and updates number of strings', () => {
    useChordStore.getState().setTuningPreset('bass4');
    const state = useChordStore.getState();

    expect(state.tuningPreset).toBe('bass4');
    expect(state.tuning).toEqual(STANDARD_BASS);
    expect(state.voicings.length).toBeGreaterThan(0);
    // In bass tuning, frets array has length 4
    expect(state.voicings[0].frets).toHaveLength(4);
  });

  it('allows individual string tuning adjustments', () => {
    // Drop 6th string from E2 to D2
    useChordStore.getState().setStringTuning(0, 'D2');
    const state = useChordStore.getState();

    expect(state.tuning[0]).toBe('D2');
    expect(state.tuningPreset).toBe('custom');
    expect(state.voicings.length).toBeGreaterThan(0);
  });

  it('applies filters and constraint changes immediately', () => {
    // Set noBarre
    useChordStore.getState().setConstraints({ noBarre: true });
    let state = useChordStore.getState();
    for (const v of state.voicings) {
      expect(v.hasBarre).toBe(false);
    }

    // Set easyOnly
    useChordStore.getState().setConstraints({ easyOnly: true });
    state = useChordStore.getState();
    for (const v of state.voicings) {
      expect(v.difficultyScore).toBeLessThanOrEqual(22);
    }
  });

  it('identifies equivalent / enharmonic chords', () => {
    useChordStore.getState().setRoot('C#');
    useChordStore.getState().setModifier('m');
    const state = useChordStore.getState();

    // C#m is enharmonically Dbm
    expect(state.equivalentChords).toContain('Dbm');
  });

  it('selects a specific voicing by id and updates selectedVoicing', () => {
    const state = useChordStore.getState();
    const secondVoicing = state.voicings[1];
    expect(secondVoicing).toBeDefined();

    useChordStore.getState().selectVoicing(secondVoicing.id);
    const updated = useChordStore.getState();
    expect(updated.selectedVoicingId).toBe(secondVoicing.id);
    expect(updated.selectedVoicing?.id).toBe(secondVoicing.id);
  });
});
