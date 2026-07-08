'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { accessibility, cn } from '@/design';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export default function Modal({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) {
  const firstFieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';
    const focusable = firstFieldRef.current?.querySelector<HTMLElement>('input, textarea, select, button');
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
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-bg-primary/80 backdrop-blur-sm"
      />

      <div className="relative flex min-h-full items-center justify-center p-4">
        <div
          ref={firstFieldRef}
          className={cn(
            'w-full rounded-lg border border-neutral-titanium/20 bg-bg-secondary p-6 shadow-elevation',
            SIZE_CLASSES[size]
          )}
        >
          <div className="flex items-center justify-between">
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

          <div className="mt-4">{children}</div>

          {footer && <div className="mt-6 flex items-center justify-end gap-2">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
