import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FretboardDiagram } from '../FretboardDiagram';
import { solveChords } from '../../core/chord-solver';
import { STANDARD_GUITAR } from '../../core/fretboard';

describe('FretboardDiagram Component', () => {
  const voicingsC = solveChords('C', STANDARD_GUITAR, { allowInversions: false });
  const openC = voicingsC.find((v) => v.tabString === 'X32010')!;

  const voicingsCm = solveChords('Cm', STANDARD_GUITAR, { allowInversions: true });
  const barreCm = voicingsCm.find((v) => v.tabString === 'X35543')!;

  it('renders SVG with correct title and accessible label', () => {
    render(<FretboardDiagram voicing={openC} />);

    const svg = screen.getByLabelText(/Diagrama de acorde/i);
    expect(svg).toBeDefined();
    expect(svg.tagName.toLowerCase()).toBe('svg');
  });

  it('renders X for muted strings and O for open strings on X32010', () => {
    const { container } = render(<FretboardDiagram voicing={openC} />);

    // String 0 is muted (X)
    const mutedMarkers = container.querySelectorAll('[data-testid="marker-mute"]');
    expect(mutedMarkers.length).toBe(1);

    // Strings 3 and 5 are open (O)
    const openMarkers = container.querySelectorAll('[data-testid="marker-open"]');
    expect(openMarkers.length).toBe(2);
  });

  it('displays base fret indicator when baseFret > 1', () => {
    const { container } = render(<FretboardDiagram voicing={barreCm} />);

    // Cm barre has baseFret 3, should display "3fr"
    const fretLabel = container.querySelector('[data-testid="base-fret-label"]');
    expect(fretLabel).toBeDefined();
    expect(fretLabel?.textContent).toContain('3fr');
  });

  it('renders solid barre visual element for barre chords', () => {
    const { container } = render(<FretboardDiagram voicing={barreCm} />);

    const barreElement = container.querySelector('[data-testid="barre-pill"]');
    expect(barreElement).toBeDefined();
  });

  it('inverts string positions horizontally when isLeftHanded is true', () => {
    const { container: rightContainer } = render(
      <FretboardDiagram voicing={openC} isLeftHanded={false} />
    );
    const { container: leftContainer } = render(
      <FretboardDiagram voicing={openC} isLeftHanded={true} />
    );

    const rightMute = rightContainer.querySelector('[data-testid="marker-mute"]');
    const leftMute = leftContainer.querySelector('[data-testid="marker-mute"]');

    const rightX = Number(rightMute?.getAttribute('data-cx'));
    const leftX = Number(leftMute?.getAttribute('data-cx'));

    // In right-handed mode, string 0 is on the left. In left-handed mode, it should be on the right.
    expect(leftX).toBeGreaterThan(rightX);
  });

  it('highlights vibrating string when activeStringIndex is set', () => {
    const { container } = render(
      <FretboardDiagram voicing={openC} activeStringIndex={2} />
    );

    const activeString = container.querySelector('[data-string-index="2"]');
    expect(activeString).toBeDefined();
    expect(activeString?.getAttribute('data-active')).toBe('true');
  });

  it('triggers onNoteClick when a fretted dot is clicked', () => {
    const onNoteClick = vi.fn();
    const { container } = render(
      <FretboardDiagram voicing={openC} onNoteClick={onNoteClick} />
    );

    const firstFretDot = container.querySelector('[data-testid="fret-dot-1"]');
    expect(firstFretDot).toBeDefined();
    if (firstFretDot) {
      fireEvent.click(firstFretDot);
      expect(onNoteClick).toHaveBeenCalled();
    }
  });

  it('renders high-fret tabs as one cell per string instead of a parenthesized string', () => {
    const high = solveChords('C', STANDARD_GUITAR, { upToFret: 15 }).find((v) =>
      v.frets.some((f) => f >= 10)
    )!;
    render(<FretboardDiagram voicing={high} />);

    const tab = screen.getByLabelText(/^Tablatura /);
    expect(tab.textContent).not.toContain('(');
    expect(tab.children.length).toBe(high.frets.length);
  });

  it('keeps the compact tab for single-digit voicings', () => {
    render(<FretboardDiagram voicing={openC} />);
    expect(screen.getByLabelText(/^Tablatura /).textContent).toBe('X32010');
  });

  it('triggers onStrum when the diagram is clicked', () => {
    const onStrum = vi.fn();
    render(<FretboardDiagram voicing={openC} onStrum={onStrum} />);

    const diagram = screen.getByLabelText(/Diagrama de acorde/i);
    fireEvent.click(diagram);
    expect(onStrum).toHaveBeenCalledWith(openC);
  });
});
