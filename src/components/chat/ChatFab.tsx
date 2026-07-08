'use client';

import { MessageCircle, X } from 'lucide-react';
import { accessibility, cn } from '@/design';
import type { ChatUIMode } from '@/types/chat';

interface ChatFabProps {
  uiMode: ChatUIMode;
  unreadCount: number;
  onOpen: () => void;
  onClose: () => void;
}

export default function ChatFab({ uiMode, unreadCount, onOpen, onClose }: ChatFabProps) {
  const isOpen = uiMode !== 'closed';

  return (
    <button
      type="button"
      aria-label={isOpen ? 'Close AI assistant' : `Open AI assistant${unreadCount > 0 ? `, ${unreadCount} unread messages` : ''}`}
      aria-expanded={isOpen}
      onClick={isOpen ? onClose : onOpen}
      className={cn(
        'relative flex h-14 w-14 items-center justify-center rounded-full bg-accent-primary text-bg-primary shadow-elevation transition-colors duration-300 hover:bg-accent-dark',
        accessibility.focusRing
      )}
    >
      {isOpen ? <X size={24} aria-hidden="true" /> : <MessageCircle size={24} aria-hidden="true" />}
      {!isOpen && unreadCount > 0 && (
        <span
          aria-hidden="true"
          className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-error text-[11px] font-bold text-neutral-white"
        >
          {unreadCount}
        </span>
      )}
    </button>
  );
}
