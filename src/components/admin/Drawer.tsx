'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { accessibility, cn } from '@/design';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function Drawer({ isOpen, onClose, title, children, footer }: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';
    const focusable = panelRef.current?.querySelector<HTMLElement>('input, textarea, select, button');
    focusable?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-modal" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        aria-label="Close panel"
        onClick={onClose}
        className="absolute inset-0 bg-bg-primary/80 backdrop-blur-sm"
      />

      <div
        ref={panelRef}
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-bg-secondary shadow-elevation animate-in slide-in-from-right duration-300"
      >
        <div className="flex items-center justify-between border-b border-neutral-titanium/20 px-6 py-4">
          <h2 className="text-h5 font-heading font-semibold text-neutral-white">{title}</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className={cn('rounded-md p-1.5 text-neutral-silver hover:text-accent-primary', accessibility.focusRing)}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-neutral-titanium/20 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
