import { describe, it, expect } from 'vitest';
import { solvePlayability, calculateDifficultyScore } from '../playability';

describe('Playability & Ergonomics Solver', () => {
  it('calculates difficulty score directly with known inputs', () => {
    const score = calculateDifficultyScore({
      baseFret: 1,
      fretSpan: 3,
      fingersCount: 3,
      hasBarre: false,
      openStringsCount: 2,
      mutedStringsCount: 1,
    });
    // baseFret: 1*1.2 = 1.2
    // fingers: 3*3 = 9
    // barre: 0
    // span: 3*2 = 6
    // open: -2*4 = -8
    // mute: 1*1.5 = 1.5
    // total = 1.2 + 9 + 6 - 8 + 1.5 = 9.7
    expect(score).toBe(9.7);
  });

  it('assigns fingers and scores standard open C chord (X32010)', () => {
    const frets = [-1, 3, 2, 0, 1, 0];
    const result = solvePlayability(frets, { maxSpan: 4 });

    expect(result).not.toBeNull();
    if (!result) return;

    expect(result.hasBarre).toBe(false);
    expect(result.barres).toHaveLength(0);
    // Open strings (0) and muted (-1) must have null finger
    expect(result.fingers[0]).toBeNull(); // string 6 (X)
    expect(result.fingers[3]).toBeNull(); // string 3 (fret 0)
    expect(result.fingers[5]).toBeNull(); // string 1 (fret 0)

    // Fretted strings must have fingers 1, 2, 3 assigned logically:
    // Fret 1 on string 4 (B3) should have finger 1
    // Fret 2 on string 2 (D3) should have finger 2
    // Fret 3 on string 1 (A2) should have finger 3
    expect(result.fingers[4]).toBe(1);
    expect(result.fingers[2]).toBe(2);
    expect(result.fingers[1]).toBe(3);

    expect(result.difficultyScore).toBeLessThan(15);
  });

  it('detects 1st fret barre for standard F major chord (133211)', () => {
    const frets = [1, 3, 3, 2, 1, 1];
    const result = solvePlayability(frets, { maxSpan: 4 });

    expect(result).not.toBeNull();
    if (!result) return;

    expect(result.hasBarre).toBe(true);
    expect(result.barres).toHaveLength(1);
    expect(result.barres[0].fret).toBe(1);
    expect(result.barres[0].finger).toBe(1);
    expect(result.barres[0].fromString).toBe(0);
    expect(result.barres[0].toString).toBe(5);

    // Finger 1 should be on the barre strings at fret 1
    expect(result.fingers[0]).toBe(1);
    expect(result.fingers[4]).toBe(1);
    expect(result.fingers[5]).toBe(1);

    // Higher frets
    expect(result.fingers[3]).toBe(2); // Fret 2 (G string) -> finger 2
    expect(result.fingers[1]).toBe(3); // Fret 3 (A string) -> finger 3
    expect(result.fingers[2]).toBe(4); // Fret 3 (D string) -> finger 4
  });

  it('detects 2nd fret barre for standard Bm chord (X24432)', () => {
    const frets = [-1, 2, 4, 4, 3, 2];
    const result = solvePlayability(frets, { maxSpan: 4 });

    expect(result).not.toBeNull();
    if (!result) return;

    expect(result.hasBarre).toBe(true);
    expect(result.barres[0].fret).toBe(2);
    expect(result.barres[0].fromString).toBe(1);
    expect(result.barres[0].toString).toBe(5);

    expect(result.fingers[1]).toBe(1); // Fret 2 (A string)
    expect(result.fingers[5]).toBe(1); // Fret 2 (high E string)
    expect(result.fingers[4]).toBe(2); // Fret 3 (B string)
  });

  it('rejects chords that exceed max span', () => {
    // Fret 1 to fret 7 is span 7 (impossible without capo/open strings)
    const impossibleFrets = [1, 7, 7, -1, -1, -1];
    const result = solvePlayability(impossibleFrets, { maxSpan: 4 });
    expect(result).toBeNull();
  });

  it('rejects chords that require more than 4 fingers', () => {
    // 5 different frets with no barre possible: 1, 2, 3, 4, 5 on 5 strings
    // Fret 1 on string 0, fret 2 on string 1, fret 3 on string 2, fret 4 on string 3, fret 5 on string 4
    const fiveFingers = [1, 2, 3, 4, 5, -1];
    const result = solvePlayability(fiveFingers, { maxSpan: 5 });
    expect(result).toBeNull();
  });

  it('rejects barre when an open string (0) is inside the barre span', () => {
    // Attempting barre at fret 2 between string 0 and string 4, but string 2 is open (fret 0)
    // A finger cannot barre across an open ringing string!
    const frets = [2, 3, 0, 3, 2, -1];
    const result = solvePlayability(frets, { maxSpan: 4 });
    // If it succeeds, it must NOT mark a barre across string 2
    if (result && result.hasBarre) {
      for (const b of result.barres) {
        expect(b.fromString <= 2 && b.toString >= 2).toBe(false);
      }
    }
  });
});
