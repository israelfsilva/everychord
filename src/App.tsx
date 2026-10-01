import { useEffect, useState } from 'react';
import { HeaderBar } from './components/HeaderBar';
import { ChordSelector } from './components/ChordSelector';
import { ChordGrid } from './components/ChordGrid';
import { NeckPanel } from './components/NeckPanel';
import { SiteFooter } from './components/SiteFooter';
import { cn } from '@/lib/utils';

export function App() {
  // Below lg the sidebar is an off-canvas drawer
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawerOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  return (
    <div className="grid h-dvh w-screen grid-cols-[minmax(0,1fr)] grid-rows-[60px_minmax(0,1fr)_auto_auto] overflow-hidden bg-bg text-[13px] text-text">
      <HeaderBar onMenuClick={() => setDrawerOpen(true)} />

      <div className="relative grid min-h-0 grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)] lg:grid-cols-[320px_minmax(0,1fr)]">
        {drawerOpen && (
          <div
            className="absolute inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
        )}
        <aside
          className={cn(
            'absolute inset-y-0 left-0 z-40 w-[320px] max-w-[88vw] border-r border-line bg-surface transition-transform duration-200 ease-out',
            'lg:static lg:z-auto lg:min-h-0 lg:w-auto lg:max-w-none lg:translate-x-0',
            drawerOpen ? 'translate-x-0 shadow-2xl lg:shadow-none' : '-translate-x-full'
          )}
        >
          <ChordSelector />
        </aside>

        <main className="min-h-0 min-w-0">
          <ChordGrid />
        </main>
      </div>

      <section className="border-t border-line bg-surface px-(--pad) py-3.5">
        <NeckPanel />
      </section>

      <SiteFooter />
    </div>
  );
}

export default App;
