'use client';

import { useEffect, useRef } from 'react';
import { Maximize2, Minimize2, Minus, X } from 'lucide-react';
import { accessibility, cn } from '@/design';
import type { useChatAssistant } from '@/hooks/useChatAssistant';
import MessageList from './MessageList';
import Composer from './Composer';

interface ChatPanelProps {
  chat: ReturnType<typeof useChatAssistant>;
}

export default function ChatPanel({ chat }: ChatPanelProps) {
  const { state } = chat;
  const panelRef = useRef<HTMLDivElement>(null);
  const isFullscreen = state.uiMode === 'fullscreen';
  const isMinimized = state.uiMode === 'minimized';

  useEffect(() => {
    panelRef.current?.querySelector('textarea')?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      if (state.status === 'streaming') {
        chat.stopGenerating();
      } else if (isFullscreen) {
        chat.toggleFullscreen();
      } else {
        chat.close();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.status, isFullscreen, chat]);

  useEffect(() => {
    if (!isFullscreen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  // Real focus trap for fullscreen only — the lighter Escape/click-outside
  // pattern used elsewhere in the app (see MobileMenu.tsx) is fine for a
  // small popover, but fullscreen covers the whole viewport like a true modal.
  useEffect(() => {
    if (!isFullscreen) return;
    function handleTab(event: KeyboardEvent) {
      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    window.addEventListener('keydown', handleTab);
    return () => window.removeEventListener('keydown', handleTab);
  }, [isFullscreen]);

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal={isFullscreen || undefined}
      aria-label="Premium TechNoir AI Assistant"
      className={cn(
        'mb-4 flex flex-col overflow-hidden rounded-lg border border-neutral-titanium/20 bg-bg-secondary shadow-elevation transition-all duration-300',
        isFullscreen ? 'fixed inset-0 z-modal mb-0 rounded-none' : 'h-[32rem] w-80 tablet:w-96'
      )}
    >
      <div className="flex items-center justify-between border-b border-neutral-titanium/20 px-4 py-3">
        <p className="text-body-md font-body font-semibold text-neutral-white">TechNoir Assistant</p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={isMinimized ? 'Expand chat' : 'Minimize chat'}
            onClick={chat.minimize}
            className={cn('rounded-md p-1.5 text-neutral-silver hover:text-accent-primary', accessibility.focusRing)}
          >
            <Minus size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            onClick={chat.toggleFullscreen}
            className={cn('rounded-md p-1.5 text-neutral-silver hover:text-accent-primary', accessibility.focusRing)}
          >
            {isFullscreen ? <Minimize2 size={16} aria-hidden="true" /> : <Maximize2 size={16} aria-hidden="true" />}
          </button>
          <button
            type="button"
            aria-label="Close chat"
            onClick={chat.close}
            className={cn('rounded-md p-1.5 text-neutral-silver hover:text-accent-primary', accessibility.focusRing)}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <MessageList
            messages={state.messages}
            onQuickReply={(option) => void chat.sendMessage(option)}
            disabled={state.status === 'streaming'}
          />
          <Composer chat={chat} />
        </>
      )}
    </div>
  );
}
