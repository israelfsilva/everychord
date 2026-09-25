import { HeaderBar } from './components/HeaderBar';
import { ChordSelector } from './components/ChordSelector';
import { ChordGrid } from './components/ChordGrid';
import { BottomConsole } from './components/BottomConsole';

export function App() {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground antialiased">
      {/* 1. Header Bar */}
      <HeaderBar />

      {/* 2. Main Middle Workspace: Left Chord Selector + Center Diagram Grid */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left Column: Root and Modifier Matrix */}
        <aside className="w-80 shrink-0 overflow-hidden">
          <ChordSelector />
        </aside>

        {/* Center: Chord Diagram Grid */}
        <section className="flex-1 overflow-hidden">
          <ChordGrid />
        </section>
      </main>

      {/* 3. Bottom Studio Console: Tuning Controls, Enharmonics & Ergonomic Filters */}
      <footer className="shrink-0">
        <BottomConsole />
      </footer>
    </div>
  );
}

export default App;
