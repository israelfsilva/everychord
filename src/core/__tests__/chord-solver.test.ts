import { describe, it, expect } from 'vitest';
import { solveChords, validateVoicingForChord } from '../chord-solver';
import { STANDARD_GUITAR, fretsToTab, tabToFrets } from '../fretboard';

describe('Chord Solver Engine (Pure Combinatorial Client-Side)', () => {
  describe('Fundamental Chords in Standard Tuning', () => {
    it('generates valid voicings for C major including standard open chord', () => {
      const voicings = solveChords('C', STANDARD_GUITAR, {
        maxSpan: 4,
        upToFret: 12,
        allowInversions: false,
      });

      expect(voicings.length).toBeGreaterThan(0);

      // Verify that every voicing contains only notes of C major (C, E, G)
      for (const v of voicings) {
        expect(v.rootNote).toBe('C');
        expect(v.isRootInBass).toBe(true);
        for (const p of v.pitchClasses) {
          expect(['C', 'E', 'G']).toContain(p);
        }
      }

      // Standard open C shape: X32010
      const openC = voicings.find((v) => v.tabString === 'X32010');
      expect(openC).toBeDefined();
      if (openC) {
        expect(openC.frets).toEqual([-1, 3, 2, 0, 1, 0]);
        expect(openC.hasBarre).toBe(false);
        expect(openC.difficultyScore).toBeLessThan(15);
      }
    });

    it('generates valid voicings for G major including standard open chord', () => {
      const voicings = solveChords('G', STANDARD_GUITAR, {
        maxSpan: 4,
        upToFret: 12,
        allowInversions: false,
      });

      expect(voicings.length).toBeGreaterThan(0);

      // Check standard open G (320003 or 320033)
      const openG1 = voicings.find((v) => v.tabString === '320003');
      const openG2 = voicings.find((v) => v.tabString === '320033');
      expect(openG1 || openG2).toBeDefined();
    });

    it('generates valid voicings for A minor including standard open chord', () => {
      const voicings = solveChords('Am', STANDARD_GUITAR, {
        maxSpan: 4,
        upToFret: 12,
        allowInversions: false,
      });

      expect(voicings.length).toBeGreaterThan(0);

      // Standard open Am: X02210
      const openAm = voicings.find((v) => v.tabString === 'X02210');
      expect(openAm).toBeDefined();
      if (openAm) {
        expect(openAm.hasBarre).toBe(false);
        expect(openAm.rootNote).toBe('A');
      }
    });

    it('generates valid voicings for C minor (Cm)', () => {
      const voicings = solveChords('Cm', STANDARD_GUITAR, {
        maxSpan: 4,
        upToFret: 15,
        allowInversions: true,
      });

      expect(voicings.length).toBeGreaterThan(0);

      for (const v of voicings) {
        expect(v.rootNote).toBe('C');
        for (const p of v.pitchClasses) {
          expect(['C', 'Eb', 'G']).toContain(p);
        }
      }

      // Classic barre Cm at 3rd fret: X35543
      const barreCm = voicings.find((v) => v.tabString === 'X35543');
      expect(barreCm).toBeDefined();
      if (barreCm) {
        expect(barreCm.hasBarre).toBe(true);
        expect(barreCm.barres[0].fret).toBe(3);
      }

      // Inversion / high triad Cm: XX5543
      const triadCm = voicings.find((v) => v.tabString === 'XX5543');
      expect(triadCm).toBeDefined();
    });
  });

  describe('Barre Chord Detection', () => {
    it('detects 1st fret barre for F major (133211)', () => {
      const voicings = solveChords('F', STANDARD_GUITAR, {
        maxSpan: 4,
        upToFret: 12,
      });

      const fBarre = voicings.find((v) => v.tabString === '133211');
      expect(fBarre).toBeDefined();
      if (fBarre) {
        expect(fBarre.hasBarre).toBe(true);
        expect(fBarre.barres[0].fret).toBe(1);
        expect(fBarre.barres[0].finger).toBe(1);
        expect(fBarre.barres[0].fromString).toBe(0);
        expect(fBarre.barres[0].toString).toBe(5);
      }
    });

    it('detects 2nd fret barre for B minor (X24432)', () => {
      const voicings = solveChords('Bm', STANDARD_GUITAR, {
        maxSpan: 4,
        upToFret: 12,
      });

      const bmBarre = voicings.find((v) => v.tabString === 'X24432');
      expect(bmBarre).toBeDefined();
      if (bmBarre) {
        expect(bmBarre.hasBarre).toBe(true);
        expect(bmBarre.barres[0].fret).toBe(2);
        expect(bmBarre.barres[0].finger).toBe(1);
      }
    });
  });

  describe('Tab & Formation Validation (including XX2043 analysis for Cm)', () => {
    it('validates whether XX2043 is a valid Cm chord formation', () => {
      // Parse XX2043 into frets
      const frets = tabToFrets('XX2043');
      expect(frets).toEqual([-1, -1, 2, 0, 4, 3]);
      expect(fretsToTab(frets)).toBe('XX2043');

      // Validate against Cm
      const validation = validateVoicingForChord('Cm', frets, STANDARD_GUITAR);

      // XX2043 contains:
      // String 4 (D3) fret 2 -> E3 (Major third of C, NOT in Cm!)
      // String 3 (G3) fret 0 -> G3
      // String 2 (B3) fret 4 -> Eb4
      // String 1 (E4) fret 3 -> G4
      // Note C is completely missing, and E is alien to Cm!
      expect(validation.isValid).toBe(false);
      expect(validation.soundingPitchClasses).toEqual(['E', 'G', 'Eb']);
      expect(validation.missingNotes).toContain('C');
      expect(validation.alienNotes).toContain('E');

      // Conversely, genuine Cm formations like X35543 and XX5543 MUST be valid
      const validBarre = validateVoicingForChord('Cm', tabToFrets('X35543'), STANDARD_GUITAR);
      expect(validBarre.isValid).toBe(true);
      expect(validBarre.alienNotes).toHaveLength(0);

      const validTriad = validateVoicingForChord('Cm', tabToFrets('XX5543'), STANDARD_GUITAR);
      expect(validTriad.isValid).toBe(true);
    });
  });

  describe('Filters and Constraints', () => {
    it('respects noBarre constraint by filtering out barre chords', () => {
      const voicings = solveChords('F', STANDARD_GUITAR, {
        noBarre: true,
        allowInversions: true,
      });

      for (const v of voicings) {
        expect(v.hasBarre).toBe(false);
      }
    });

    it('respects easyOnly constraint by selecting only lower difficulty voicings', () => {
      const voicings = solveChords('C', STANDARD_GUITAR, {
        easyOnly: true,
      });

      expect(voicings.length).toBeGreaterThan(0);
      for (const v of voicings) {
        expect(v.difficultyScore).toBeLessThanOrEqual(22);
      }
    });
  });
});
