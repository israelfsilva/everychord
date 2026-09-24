import { Note } from '@tonaljs/tonal';
import {
  STANDARD_GUITAR,
  analyzeVoicingNotes,
  fretsToTab,
  getChordDefinition,
  getFretNote,
} from './fretboard';
import { solvePlayability } from './playability';
import type { ChordVoicing, FretMarker, SearchConstraints, Tuning } from './types';

export interface VoicingValidationResult {
  isValid: boolean;
  soundingPitchClasses: string[];
  missingNotes: string[];
  alienNotes: string[];
  reason?: string;
}

/**
 * Validates whether a specific frets formation matches a chord symbol.
 */
export function validateVoicingForChord(
  chordSymbol: string,
  frets: number[],
  tuning: Tuning = STANDARD_GUITAR
): VoicingValidationResult {
  const chordDef = getChordDefinition(chordSymbol);
  const analysis = analyzeVoicingNotes(frets, tuning);

  if (analysis.isMutedAll) {
    return {
      isValid: false,
      soundingPitchClasses: [],
      missingNotes: chordDef.notes,
      alienNotes: [],
      reason: 'All strings are muted',
    };
  }

  // Find alien notes that don't belong to the chord
  const alienNotes = analysis.pitchClasses.filter(
    (pc) => !chordDef.chromas.includes(Note.chroma(pc) ?? -1)
  );

  // Find missing essential notes (at least root and 3rd/5th)
  const missingNotes = chordDef.notes.filter(
    (n) => !analysis.chromas.includes(Note.chroma(n) ?? -1)
  );

  const isValid = alienNotes.length === 0 && !missingNotes.includes(chordDef.tonic);

  return {
    isValid,
    soundingPitchClasses: analysis.pitchClasses,
    missingNotes,
    alienNotes,
    reason: !isValid
      ? alienNotes.length > 0
        ? `Contains alien notes: ${alienNotes.join(', ')}`
        : `Missing root note: ${chordDef.tonic}`
      : undefined,
  };
}

/**
 * Pure combinatorial chord solver using sliding fret windows and branch-and-bound pruning.
 */
export function solveChords(
  chordSymbol: string,
  tuning: Tuning = STANDARD_GUITAR,
  constraints: SearchConstraints = {}
): ChordVoicing[] {
  const chordDef = getChordDefinition(chordSymbol);
  const maxSpan = constraints.maxSpan ?? 4;
  const upToFret = constraints.upToFret ?? 15;
  const allowInversions = constraints.allowInversions ?? false;
  const omit5 = constraints.omit5 ?? false;
  const omit3 = constraints.omit3 ?? false;
  const noBarre = constraints.noBarre ?? false;
  const easyOnly = constraints.easyOnly ?? false;

  const tonicChroma = chordDef.chromas[0];

  // Determine essential chromas
  // intervals: e.g. ["1P", "3M", "5P"] or ["1P", "3m", "5P"]
  const essentialChromas: number[] = [];
  for (let i = 0; i < chordDef.intervals.length; i++) {
    const interval = chordDef.intervals[i];
    const chroma = chordDef.chromas[i];

    if (interval.startsWith('1')) {
      essentialChromas.push(chroma); // Root is always essential
    } else if (interval.startsWith('3')) {
      if (!omit3) essentialChromas.push(chroma);
    } else if (interval.startsWith('5')) {
      // 5th can be omitted if omit5 is requested, or in extended chords (>= 4 notes)
      if (!omit5 && chordDef.notes.length <= 3) {
        essentialChromas.push(chroma);
      }
    } else {
      // 7ths, 9ths, etc. are essential for those chord types
      essentialChromas.push(chroma);
    }
  }

  const numStrings = tuning.length;
  const seenVoicingIds = new Set<string>();
  const results: ChordVoicing[] = [];

  // Iterate sliding windows across the fretboard
  const minWindow = 1;
  const maxWindow = Math.max(1, upToFret - maxSpan + 1);

  for (let w = minWindow; w <= maxWindow; w++) {
    const windowStart = w;
    const windowEnd = Math.min(upToFret, w + maxSpan - 1);

    // Build candidate frets for each string within this window
    const stringCandidates: number[][] = [];

    for (let s = 0; s < numStrings; s++) {
      const openNote = tuning[s];
      const candidates: number[] = [-1]; // Mute is always an option

      // Open string (fret 0)
      const openInfo = getFretNote(openNote, 0);
      if (chordDef.chromas.includes(openInfo.chroma)) {
        candidates.push(0);
      }

      // Frets inside the current window [windowStart, windowEnd]
      for (let f = windowStart; f <= windowEnd; f++) {
        const fretInfo = getFretNote(openNote, f);
        if (chordDef.chromas.includes(fretInfo.chroma)) {
          candidates.push(f);
        }
      }

      stringCandidates.push(candidates);
    }

    // Branch and Bound search across strings
    function searchString(
      strIdx: number,
      currentFrets: number[],
      frettedStrings: number[],
      bassChroma: number
    ) {
      if (strIdx === numStrings) {
        // Evaluate complete candidate
        const analysis = analyzeVoicingNotes(currentFrets, tuning);
        if (analysis.isMutedAll) return;

        // Check root in bass rule
        const isRootInBass = analysis.bassChroma === tonicChroma;
        if (!allowInversions && !isRootInBass) return;

        // Check that all essential chromas are present
        const hasAllEssential = essentialChromas.every((ec) =>
          analysis.chromas.includes(ec)
        );
        if (!hasAllEssential) return;

        // Check if all sounding notes strictly belong to the chord
        const hasAlienNotes = analysis.chromas.some(
          (c) => !chordDef.chromas.includes(c)
        );
        if (hasAlienNotes) return;

        const id = currentFrets.join('-');
        if (seenVoicingIds.has(id)) return;

        // Evaluate playability and finger assignment
        const playability = solvePlayability(currentFrets, constraints);
        if (!playability) return;

        if (noBarre && playability.hasBarre) return;
        if (easyOnly && playability.difficultyScore > 22) return;

        seenVoicingIds.add(id);

        const tabString = fretsToTab(currentFrets);

        // Build FretMarker array
        const markers: FretMarker[] = currentFrets.map((fret, sIdx) => {
          if (fret === -1) {
            return {
              stringIndex: sIdx,
              fret: -1,
              finger: null,
              note: '',
              pitchClass: '',
              chroma: -1,
            };
          }
          const info = getFretNote(tuning[sIdx], fret);
          return {
            stringIndex: sIdx,
            fret,
            finger: playability.fingers[sIdx],
            note: info.note,
            pitchClass: info.pitchClass,
            chroma: info.chroma,
          };
        });

        results.push({
          id,
          frets: [...currentFrets],
          fingers: playability.fingers,
          markers,
          baseFret: playability.baseFret,
          fretSpan: playability.fretSpan,
          barres: playability.barres,
          difficultyScore: playability.difficultyScore,
          tabString,
          notes: analysis.soundingNotes,
          pitchClasses: analysis.pitchClasses,
          rootNote: chordDef.tonic,
          bassNote: analysis.bassNote,
          isRootInBass,
          hasBarre: playability.hasBarre,
        });
        return;
      }

      const candidates = stringCandidates[strIdx];

      for (let i = 0; i < candidates.length; i++) {
        const fret = candidates[i];

        // Finger budgeting heuristic for pruning:
        // A hand has 4 fingers. If multiple strings share minFret, finger 1 can barre them.
        // Thus, notes strictly above minFret cannot exceed 3 fingers (or 4 if no barre).
        let nextFretted = frettedStrings;
        if (fret > 0) {
          nextFretted = [...frettedStrings, fret];
          const minF = Math.min(...nextFretted);
          const aboveMinFretCount = nextFretted.filter((f) => f > minF).length;
          // Even with a barre, we only have fingers 2, 3, 4 for frets > minF
          if (aboveMinFretCount > 3) continue;
          // Overall fret span within fretted strings must not exceed maxSpan
          const maxF = Math.max(...nextFretted);
          if (maxF - minF + 1 > maxSpan) continue;
        }

        let nextBassChroma = bassChroma;
        if (fret >= 0 && bassChroma === -1) {
          const info = getFretNote(tuning[strIdx], fret);
          nextBassChroma = info.chroma;
          // Pruning: If inversions not allowed, first sounding string MUST be tonic
          if (!allowInversions && nextBassChroma !== tonicChroma) {
            continue;
          }
        }

        currentFrets[strIdx] = fret;
        searchString(strIdx + 1, currentFrets, nextFretted, nextBassChroma);
      }
    }

    const initialFrets = new Array(numStrings).fill(-1);
    searchString(0, initialFrets, [], -1);
  }

  // Sort results:
  // 1. difficultyScore ascending
  // 2. baseFret ascending
  // 3. tabString
  results.sort((a, b) => {
    if (a.difficultyScore !== b.difficultyScore) {
      return a.difficultyScore - b.difficultyScore;
    }
    if (a.baseFret !== b.baseFret) {
      return a.baseFret - b.baseFret;
    }
    return a.tabString.localeCompare(b.tabString);
  });

  return results;
}
