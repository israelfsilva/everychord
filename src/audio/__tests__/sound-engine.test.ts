import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SoundEngine } from '../sound-engine';
import { solveChords } from '../../core/chord-solver';
import { STANDARD_GUITAR } from '../../core/fretboard';

describe('Sound Engine & Strumming Synthesizer', () => {
  let engine: SoundEngine;

  beforeEach(() => {
    // Instantiate with mock driver enabled for tests
    engine = new SoundEngine({ useMockDriver: true });
  });

  it('initializes cleanly in test environment without throwing Web Audio errors', async () => {
    await expect(engine.init()).resolves.toBe(true);
    expect(engine.isReady).toBe(true);
  });

  it('plays a single note with note name and velocity', async () => {
    await engine.init();
    const result = engine.playNote('C3', 0.8);

    expect(result).toBe(true);
    const mockDriver = engine.getDriver();
    expect(mockDriver.history).toHaveLength(1);
    expect(mockDriver.history[0].note).toBe('C3');
    expect(mockDriver.history[0].velocity).toBe(0.8);
  });

  it('strums a chord voicing with correct staggered notes from bass to treble', async () => {
    vi.useFakeTimers();
    await engine.init();

    const voicings = solveChords('C', STANDARD_GUITAR, { allowInversions: false });
    const openC = voicings.find((v) => v.tabString === 'X32010');
    expect(openC).toBeDefined();
    if (!openC) return;

    const vibrateSpy = vi.fn();

    // Strum the chord
    const strumPromise = engine.strumChord(openC, {
      staggerMs: 30,
      direction: 'down',
      onStringVibrate: vibrateSpy,
    });

    // Initial note (string 1 - A2 fret 3 = C3) should trigger immediately
    expect(vibrateSpy).toHaveBeenCalledWith(1);

    // Fast-forward 30ms -> string 2 (D3 fret 2 = E3)
    vi.advanceTimersByTime(30);
    expect(vibrateSpy).toHaveBeenCalledWith(2);

    // Fast-forward through the rest of the 5 sounding strings
    vi.advanceTimersByTime(120);
    expect(vibrateSpy).toHaveBeenCalledTimes(5);

    // Let the strum completion timer finish
    vi.advanceTimersByTime(300);
    await strumPromise;

    const history = engine.getDriver().history;
    expect(history.map((h) => h.note)).toEqual(['C3', 'E3', 'G3', 'C4', 'E4']);

    vi.useRealTimers();
  });

  it('supports upstroke strumming from treble to bass', async () => {
    vi.useFakeTimers();
    await engine.init();

    const voicings = solveChords('C', STANDARD_GUITAR, { allowInversions: false });
    const openC = voicings.find((v) => v.tabString === 'X32010');
    if (!openC) return;

    const vibrateSpy = vi.fn();

    const strumPromise = engine.strumChord(openC, {
      staggerMs: 25,
      direction: 'up',
      onStringVibrate: vibrateSpy,
    });

    // In upstroke, highest string (string 5 - E4) sounds first
    expect(vibrateSpy).toHaveBeenCalledWith(5);

    vi.advanceTimersByTime(500);
    await strumPromise;

    const history = engine.getDriver().history;
    expect(history.map((h) => h.note)).toEqual(['E4', 'C4', 'G3', 'E3', 'C3']);

    vi.useRealTimers();
  });
});
