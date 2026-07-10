'use client';

import { MessageCircle, X } from 'lucide-react';
import { accessibility, cn } from '@/design';
import type { ChatUIMode } from '@/types/chat';

interface ChatFabProps {
  uiMode: ChatUIMode;
  unreadCount: number;
  humanMode?: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export default function ChatFab({ uiMode, unreadCount, humanMode, onOpen, onClose }: ChatFabProps) {
  const isOpen = uiMode !== 'closed';

  return (
    <button
      type="button"
      aria-label={
        isOpen
          ? 'Close AI assistant'
          : `Open AI assistant${humanMode ? ', live agent connected' : ''}${unreadCount > 0 ? `, ${unreadCount} unread messages` : ''}`
      }
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
      {humanMode && (
        <span aria-hidden="true" className="absolute -right-0.5 -bottom-0.5 flex h-4 w-4">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
          <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-bg-primary bg-success" />
        </span>
      )}
    </button>
  );
}
