import type { BarreDefinition, Finger, SearchConstraints } from './types';

export interface PlayabilityResult {
  fingers: Finger[];
  barres: BarreDefinition[];
  hasBarre: boolean;
  baseFret: number;
  fretSpan: number;
  difficultyScore: number;
}

/**
 * Calculates ergonomic difficulty score for a chord voicing.
 * Lower score = easier to play.
 */
export function calculateDifficultyScore(params: {
  baseFret: number;
  fretSpan: number;
  fingersCount: number;
  hasBarre: boolean;
  openStringsCount: number;
  mutedStringsCount: number;
  isRootInBass?: boolean;
}): number {
  const {
    baseFret,
    fretSpan,
    fingersCount,
    hasBarre,
    openStringsCount,
    mutedStringsCount,
    isRootInBass = true,
  } = params;

  let score = 0;
  // Position along the neck (lower frets are generally more familiar, but fret 1 has high string tension)
  score += baseFret * 1.2;
  // Number of fingers pressing strings
  score += fingersCount * 3.0;
  // Barre chords require significantly more finger strength
  if (hasBarre) {
    score += 8.0;
  }
  // Span reach between highest and lowest frets
  score += fretSpan * 2.0;
  // Open ringing strings make chords much easier
  score -= openStringsCount * 4.0;
  // Muted strings require intentional damping
  score += mutedStringsCount * 1.5;
  // Inversions (non-root in bass) have a slight cognitive / voicing penalty
  if (!isRootInBass) {
    score += 4.0;
  }

  return Math.round(score * 10) / 10;
}

/**
 * Analyzes frets and assigns fingers (1-4) and barres based on biomechanical heuristics.
 * Returns null if the hand shape is physically impossible.
 */
export function solvePlayability(
  frets: number[],
  constraints: SearchConstraints = {}
): PlayabilityResult | null {
  const maxSpan = constraints.maxSpan ?? 4;
  const noBarre = constraints.noBarre ?? false;

  const frettedEntries: { stringIndex: number; fret: number }[] = [];
  let openStringsCount = 0;
  let mutedStringsCount = 0;

  for (let s = 0; s < frets.length; s++) {
    const f = frets[s];
    if (f === 0) {
      openStringsCount++;
    } else if (f === -1) {
      mutedStringsCount++;
    } else if (f > 0) {
      frettedEntries.push({ stringIndex: s, fret: f });
    }
  }

  // Pure open chord or completely muted
  if (frettedEntries.length === 0) {
    return {
      fingers: frets.map(() => null),
      barres: [],
      hasBarre: false,
      baseFret: 1,
      fretSpan: 0,
      difficultyScore: 0,
    };
  }

  const fretsOnly = frettedEntries.map((e) => e.fret);
  const minFret = Math.min(...fretsOnly);
  const maxFret = Math.max(...fretsOnly);
  const fretSpan = maxFret - minFret + 1;

  // Reject if fret span exceeds maximum allowed reach
  if (fretSpan > maxSpan) {
    return null;
  }

  const baseFret = minFret > 0 ? minFret : 1;
  const fingers: Finger[] = frets.map(() => null);
  const barres: BarreDefinition[] = [];

  // Step 1: Detect potential Finger 1 barre on minFret
  const minFretStrings = frettedEntries
    .filter((e) => e.fret === minFret)
    .map((e) => e.stringIndex);

  let barreDetected = false;
  if (!noBarre && minFretStrings.length >= 2) {
    const fromString = Math.min(...minFretStrings);
    const toString = Math.max(...minFretStrings);

    // Verify no open string (0) exists between fromString and toString
    let hasOpenStringInside = false;
    for (let s = fromString; s <= toString; s++) {
      if (frets[s] === 0) {
        hasOpenStringInside = true;
        break;
      }
    }

    if (!hasOpenStringInside) {
      barreDetected = true;
      barres.push({
        fret: minFret,
        finger: 1,
        fromString,
        toString,
      });

      // Assign finger 1 to all strings held at minFret within the barre span
      for (let s = fromString; s <= toString; s++) {
        if (frets[s] === minFret) {
          fingers[s] = 1;
        }
      }
    }
  }

  // Step 2: Collect remaining positions that need finger assignment
  const unassigned = frettedEntries.filter(
    (e) => fingers[e.stringIndex] === null
  );

  // Available fingers: if barre used finger 1, we have [2, 3, 4], else [1, 2, 3, 4]
  const availableFingers: (1 | 2 | 3 | 4)[] = barreDetected ? [2, 3, 4] : [1, 2, 3, 4];

  // Sort unassigned positions:
  // Primary: fret ascending (lower frets first)
  // Secondary: stringIndex ascending
  unassigned.sort((a, b) => {
    if (a.fret !== b.fret) return a.fret - b.fret;
    return a.stringIndex - b.stringIndex;
  });

  // Check if we have enough fingers
  if (unassigned.length > availableFingers.length) {
    // Check if adjacent strings on the same higher fret can be played with a mini-barre (e.g. A-shape finger 3)
    const sameFretGroups = new Map<number, number[]>();
    for (const u of unassigned) {
      const list = sameFretGroups.get(u.fret) ?? [];
      list.push(u.stringIndex);
      sameFretGroups.set(u.fret, list);
    }

    let resolvedWithMiniBarre = false;
    // Look for a fret with 2 or 3 adjacent strings
    for (const [, strList] of sameFretGroups.entries()) {
      if (strList.length >= 2 && unassigned.length - 1 <= availableFingers.length) {
        // Can a single finger cover this mini-barre?
        resolvedWithMiniBarre = true;
        break;
      }
    }

    if (!resolvedWithMiniBarre) {
      return null; // Exceeds human finger count
    }
  }

  // Greedy finger assignment in order of fret and string
  let fingerIdx = 0;
  for (let i = 0; i < unassigned.length; i++) {
    const curr = unassigned[i];

    // Check if the previous note was on the exact same fret and adjacent string,
    // and we need to share a finger (mini-barre) to fit in 4 fingers
    const remainingNotes = unassigned.length - i;
    const remainingFingers = availableFingers.length - fingerIdx;

    if (
      remainingNotes > remainingFingers &&
      i > 0 &&
      unassigned[i - 1].fret === curr.fret &&
      Math.abs(unassigned[i - 1].stringIndex - curr.stringIndex) === 1
    ) {
      // Reuse the previous finger for adjacent mini-barre
      fingers[curr.stringIndex] = availableFingers[fingerIdx - 1];
    } else {
      if (fingerIdx >= availableFingers.length) {
        return null; // Out of fingers
      }
      fingers[curr.stringIndex] = availableFingers[fingerIdx];
      fingerIdx++;
    }
  }

  // Step 3: Biomechanical validation (No impossible finger crossings)
  // Ensure that if finger A < finger B, then fret(A) <= fret(B)
  const assignedList = frettedEntries.map((e) => ({
    stringIndex: e.stringIndex,
    fret: e.fret,
    finger: fingers[e.stringIndex] as number,
  }));

  for (let i = 0; i < assignedList.length; i++) {
    for (let j = i + 1; j < assignedList.length; j++) {
      const a = assignedList[i];
      const b = assignedList[j];

      // If finger A is lower than finger B (e.g. 1 vs 2), finger A cannot be at a strictly higher fret than finger B
      if (a.finger < b.finger && a.fret > b.fret) {
        return null; // Biomechanically impossible crossing
      }
      if (a.finger > b.finger && a.fret < b.fret) {
        return null;
      }

      // Check adjacent fingers stretch (e.g. finger 2 and 3 shouldn't be stretched 3 frets apart)
      if (b.finger - a.finger === 1 && Math.abs(b.fret - a.fret) > 2) {
        return null; // Impossible stretch between adjacent fingers
      }
    }
  }

  // Count distinct fingers actually used
  const distinctFingers = new Set(
    fingers.filter((f): f is 1 | 2 | 3 | 4 => f !== null && typeof f === 'number')
  );

  const difficultyScore = calculateDifficultyScore({
    baseFret,
    fretSpan,
    fingersCount: distinctFingers.size,
    hasBarre: barres.length > 0,
    openStringsCount,
    mutedStringsCount,
  });

  return {
    fingers,
    barres,
    hasBarre: barres.length > 0,
    baseFret,
    fretSpan,
    difficultyScore,
  };
}
