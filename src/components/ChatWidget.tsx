'use client';

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { accessibility, cn } from '@/design';

const GREETING =
  "Hi! Welcome to Premium TechNoir. I'm here to help you find the right device, answer questions about our inventory, or assist with your order. What can I help you with today?";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-fixed">
      {isOpen && (
        <div
          role="dialog"
          aria-label="Premium TechNoir AI Assistant"
          className="mb-4 w-80 rounded-lg border border-neutral-titanium/20 bg-bg-secondary p-5 shadow-elevation"
        >
          <div className="flex items-center justify-between">
            <p className="text-body-md font-body font-semibold text-neutral-white">TechNoir Assistant</p>
            <button
              type="button"
              aria-label="Close chat"
              onClick={() => setIsOpen(false)}
              className={cn('rounded-md p-1 text-neutral-silver hover:text-accent-primary', accessibility.focusRing)}
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          <p className="mt-3 text-body-sm font-body text-neutral-light-gray">{GREETING}</p>
        </div>
      )}

      <button
        type="button"
        aria-label={isOpen ? 'Close AI assistant' : 'Open AI assistant'}
        onClick={() => setIsOpen((open) => !open)}
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-full bg-accent-primary text-bg-primary shadow-elevation transition-colors duration-300 hover:bg-accent-dark',
          accessibility.focusRing
        )}
      >
        {isOpen ? <X size={24} aria-hidden="true" /> : <MessageCircle size={24} aria-hidden="true" />}
      </button>
    </div>
  );
}
