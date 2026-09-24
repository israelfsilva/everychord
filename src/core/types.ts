export type Finger = 1 | 2 | 3 | 4 | 'T' | null;

/**
 * Tuning representation: array of note names with octaves from lowest pitch to highest.
 * Example for 6-string guitar standard: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4']
 * Example for 4-string bass standard: ['E1', 'A1', 'D2', 'G2']
 */
export type Tuning = string[];

export interface BarreDefinition {
  fret: number;
  finger: Finger;
  fromString: number; // 0-indexed string index (lower string number / lower pitch)
  toString: number;   // 0-indexed string index (higher string number / higher pitch)
}

export interface FretMarker {
  stringIndex: number; // 0 = lowest pitch string
  fret: number;        // -1 = mute (X), 0 = open (O), >= 1 = fretted
  finger: Finger;      // assigned finger
  note: string;        // e.g. "C3"
  pitchClass: string;  // e.g. "C"
  chroma: number;      // 0-11
  interval?: string;   // e.g. "1P", "3M", "5P"
}

export interface ChordVoicing {
  id: string;                      // unique key, e.g. "x-3-2-0-1-0"
  frets: number[];                 // -1 for mute, 0 for open, >= 1 for fret
  fingers: Finger[];               // finger corresponding to each string
  markers: FretMarker[];           // detailed per-string marker info
  baseFret: number;                // base fret to display in diagram (1 or higher)
  fretSpan: number;                // span between min and max frets played (excluding 0 and -1)
  barres: BarreDefinition[];
  difficultyScore: number;         // lower means easier
  tabString: string;               // text representation, e.g. "X32010"
  notes: string[];                 // sounding note names with octave, e.g. ["C3", "E3", "G3", "C4", "E4"]
  pitchClasses: string[];          // distinct sounding pitch classes, e.g. ["C", "E", "G"]
  rootNote: string;                // e.g. "C"
  bassNote: string;                // lowest sounding note, e.g. "C" or "E"
  isRootInBass: boolean;           // true if bassNote matches rootNote
  hasBarre: boolean;
}

export interface SearchConstraints {
  maxSpan?: number;       // default 4 (typical max reach across fingers)
  upToFret?: number;      // default 15 (or 24)
  omit5?: boolean;        // default false
  omit3?: boolean;        // default false
  noBarre?: boolean;      // default false
  easyOnly?: boolean;     // default false
  allowInversions?: boolean; // default false (root must be lowest sounding note)
  allowThumb?: boolean;   // default false (T for thumb)
}

export interface ChordDefinition {
  symbol: string;         // e.g. "C", "Am", "G7", "Cm"
  tonic: string;          // e.g. "C", "A", "G"
  type: string;           // e.g. "major", "minor", "7"
  notes: string[];        // pitch classes, e.g. ["C", "E", "G"]
  chromas: number[];      // chroma values (0-11)
  intervals: string[];    // e.g. ["1P", "3M", "5P"]
}
