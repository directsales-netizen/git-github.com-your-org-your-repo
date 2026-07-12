'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { accessibility, cn } from '@/design';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { visibleNavItems } from '@/lib/admin/navItems';
import type { SessionRole } from '@/lib/admin/session';

/**
 * Global Cmd+K / Ctrl+K admin search — replaces the previously-decorative
 * search input in AdminTopbar (it had no onChange/onSubmit at all). Searches
 * the same ADMIN_NAV_ITEMS list AdminSidebar renders (src/lib/admin/navItems.ts)
 * so the two can never drift apart. Navigation-only for this first pass —
 * deliberately not a fuzzy full-text search over orders/customers/products,
 * which would need its own indexed API route, not a client-side nav list.
 *
 * Outer component only toggles AnimatePresence — all interactive state
 * (query, selectedIndex) lives in PaletteContent below, which mounts fresh
 * every time isOpen flips true, so it always starts blank with no
 * effect-based reset (avoids react-hooks/set-state-in-effect entirely).
 */
export default function CommandPalette({
  isOpen,
  onClose,
  adminRole,
}: {
  isOpen: boolean;
  onClose: () => void;
  adminRole?: SessionRole;
}) {
  return (
    <AnimatePresence>
      {isOpen && <PaletteContent onClose={onClose} adminRole={adminRole} />}
    </AnimatePresence>
  );
}

function PaletteContent({ onClose, adminRole }: { onClose: () => void; adminRole?: SessionRole }) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items = useMemo(() => visibleNavItems(adminRole), [adminRole]);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.label.toLowerCase().includes(q) || item.section.toLowerCase().includes(q));
  }, [items, query]);
  // Derived, not stored — avoids a second effect to reset the index whenever
  // typing shrinks the result list out from under a stale selectedIndex.
  const clampedIndex = results.length === 0 ? 0 : Math.min(selectedIndex, results.length - 1);

  // DOM-only side effects (no setState) — same pattern as Modal.tsx.
  useEffect(() => {
    inputRef.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  function navigateTo(href: string) {
    router.push(href);
    onClose();
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Escape') {
      onClose();
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedIndex(results.length === 0 ? 0 : (clampedIndex + 1) % results.length);
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedIndex(results.length === 0 ? 0 : (clampedIndex - 1 + results.length) % results.length);
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const selected = results[clampedIndex];
      if (selected) navigateTo(selected.href);
    }
  }

  const overlayVariants = reduced
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : { hidden: { opacity: 0 }, visible: { opacity: 1 } };
  const panelVariants = reduced
    ? { hidden: { opacity: 1, y: 0, scale: 1 }, visible: { opacity: 1, y: 0, scale: 1 } }
    : { hidden: { opacity: 0, y: -8, scale: 0.98 }, visible: { opacity: 1, y: 0, scale: 1 } };

  return (
    <div className="fixed inset-0 z-modal" role="dialog" aria-modal="true" aria-label="Command palette">
      <motion.button
        type="button"
        aria-label="Close command palette"
        onClick={onClose}
        className="absolute inset-0 bg-bg-primary/80 backdrop-blur-sm"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={overlayVariants}
      />

      <div className="relative flex justify-center px-4 pt-[12vh]">
        <motion.div
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={panelVariants}
          transition={{ duration: 0.15 }}
          className="w-full max-w-xl overflow-hidden rounded-lg border border-neutral-titanium/20 bg-bg-secondary shadow-elevation"
          onKeyDown={handleKeyDown}
        >
          <div className="flex items-center gap-2 border-b border-neutral-titanium/20 px-4 py-3">
            <Search size={16} className="shrink-0 text-neutral-silver" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Jump to…"
              aria-label="Search admin dashboard pages"
              role="combobox"
              aria-expanded="true"
              aria-controls="command-palette-results"
              className="w-full bg-transparent text-body-sm font-body text-neutral-white placeholder-neutral-silver/60 focus:outline-none"
            />
            <kbd className="hidden shrink-0 rounded border border-neutral-titanium/30 px-1.5 py-0.5 text-caption font-body text-neutral-silver tablet:block">
              Esc
            </kbd>
          </div>

          <ul id="command-palette-results" role="listbox" className="max-h-80 overflow-y-auto p-2">
            {results.length === 0 ? (
              <li className="px-3 py-6 text-center text-body-sm font-body text-neutral-silver">No matching pages.</li>
            ) : (
              results.map((item, index) => {
                const Icon = item.icon;
                const isSelected = index === clampedIndex;
                return (
                  <li key={item.href} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      onClick={() => navigateTo(item.href)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-body-sm font-body transition-colors duration-150',
                        isSelected ? 'bg-accent-primary/10 text-accent-primary' : 'text-neutral-light-gray',
                        accessibility.focusRing
                      )}
                    >
                      <Icon size={16} aria-hidden="true" />
                      <span>{item.label}</span>
                      <span className="ml-auto text-caption text-neutral-silver">{item.section}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
