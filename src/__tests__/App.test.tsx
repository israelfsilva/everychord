import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('OpenChords Application Integration', () => {
  it('renders application header, chord selector, diagram grid and console', () => {
    render(<App />);

    // Header title
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toContain('Open');
    expect(heading.textContent).toContain('Chords');

    // Search bar
    expect(
      screen.getByPlaceholderText(/Busca rápida/i)
    ).toBeDefined();

    // Root note buttons
    expect(screen.getByRole('button', { name: /^C$/ })).toBeDefined();
    expect(screen.getByRole('button', { name: /^G$/ })).toBeDefined();

    // Diagram grid
    expect(screen.getAllByLabelText(/Diagrama de acorde/i).length).toBeGreaterThan(0);

    // Bottom console
    expect(screen.getByText(/Voicing Selecionado/i)).toBeDefined();
    expect(screen.getByText(/Afinação por Corda/i)).toBeDefined();
    expect(screen.getByText(/Filtros & Ergonomia/i)).toBeDefined();
  });

  it('updates chord when user clicks a different root and modifier', () => {
    render(<App />);

    // Click root 'A'
    const aButton = screen.getByRole('button', { name: /^A$/ });
    fireEvent.click(aButton);

    // Click category tab 'Menor'
    const menorTab = screen.getByRole('button', { name: /^Menor$/i });
    fireEvent.click(menorTab);

    // Click modifier 'Minor (m)'
    const mButton = screen.getByRole('button', { name: /Minor \(m\)/i });
    fireEvent.click(mButton);

    // Verify active chord indicator displays Am
    expect(screen.getAllByText('Am').length).toBeGreaterThan(0);
  });

  it('updates chord via search bar submission', () => {
    render(<App />);

    const searchInput = screen.getByPlaceholderText(/Busca rápida/i);
    fireEvent.change(searchInput, { target: { value: 'D7' } });

    const submitBtn = screen.getByRole('button', { name: /^Ir$/ });
    fireEvent.click(submitBtn);

    expect(screen.getAllByText('D7').length).toBeGreaterThan(0);
  });
});
