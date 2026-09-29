/** Muted-string "×" geometry (6×6px), shared by the chord diagram and the neck panel. */
export const MUTE_HALF = 3;
export const MUTE_STROKE = 1.25;

/** SVG path for the × centered at (x, y). */
export const mutePath = (x: number, y: number, h = MUTE_HALF): string =>
  `M${x - h} ${y - h}L${x + h} ${y + h}M${x + h} ${y - h}L${x - h} ${y + h}`;
