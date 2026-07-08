'use client';

import { useEffect, useRef } from 'react';
import type { ChatMessage } from '@/types/chat';
import MessageBubble from './MessageBubble';

interface MessageListProps {
  messages: ChatMessage[];
  onQuickReply: (option: string) => void;
  disabled?: boolean;
}

export default function MessageList({ messages, onQuickReply, disabled }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  return (
    <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
      {messages.map((message) => {
        const isStreaming = Boolean(message.streaming);
        return (
          <div key={message.id} aria-live={isStreaming ? 'polite' : undefined} aria-atomic="false">
            <MessageBubble message={message} onQuickReply={onQuickReply} disabled={disabled} />
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
}
