'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { LiveConversation } from '@/types/admin';
import type { ChatMessage } from '@/types/chat';
import { adminFetch, extractAdminErrorMessage } from '@/lib/admin/adminFetch';
import { buttonVariants, cardVariants, cn, spacing, inputVariants } from '@/design';
import StatusBadge from '@/components/admin/StatusBadge';
import MessageBubble from '@/components/chat/MessageBubble';

function toChatMessage(m: LiveConversation['messages'][number]): ChatMessage {
  return {
    id: m.id,
    role: m.role,
    text: m.text,
    blocks: [],
    createdAt: m.createdAt,
    authoredBy: m.authoredBy === 'admin' ? 'human' : undefined,
  };
}

export default function LiveChatDetailClient({
  visitorId,
  initialConversation,
}: {
  visitorId: string;
  initialConversation: LiveConversation;
}) {
  const [conversation, setConversation] = useState(initialConversation);
  const [draft, setDraft] = useState('');
  const [isTakingOver, setIsTakingOver] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // No existing live-refresh infra in this codebase (see liveChatStore.ts) —
  // a self-contained poll, cleaned up on unmount, mirrors the same cadence
  // the customer widget uses for the reverse direction (useChatAssistant.ts).
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/admin/chatbot/live/${visitorId}`);
      if (!res.ok) return;
      const data: { conversation: LiveConversation } = await res.json();
      setConversation(data.conversation);
    }, 3000);
    return () => clearInterval(interval);
  }, [visitorId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [conversation.messages.length]);

  async function takeOver() {
    setIsTakingOver(true);
    setError(null);
    const res = await adminFetch(`/api/admin/chatbot/live/${visitorId}/takeover`, { method: 'POST' });
    if (res.ok) {
      const data: { conversation: LiveConversation } = await res.json();
      setConversation(data.conversation);
    } else {
      setError(await extractAdminErrorMessage(res, 'Unable to take over this conversation.'));
    }
    setIsTakingOver(false);
  }

  async function sendReply() {
    const text = draft.trim();
    if (!text) return;
    setIsSending(true);
    setError(null);
    const res = await adminFetch(`/api/admin/chatbot/live/${visitorId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (res.ok) {
      setDraft('');
      const refreshed = await fetch(`/api/admin/chatbot/live/${visitorId}`);
      if (refreshed.ok) {
        const data: { conversation: LiveConversation } = await refreshed.json();
        setConversation(data.conversation);
      }
    } else {
      setError(await extractAdminErrorMessage(res, 'Unable to send reply.'));
    }
    setIsSending(false);
  }

  const isHuman = conversation.mode === 'human';

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/chatbot/live" className="inline-flex items-center gap-1.5 text-body-sm font-body text-accent-primary hover:underline">
          <ArrowLeft size={14} aria-hidden="true" />
          Back to live conversations
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-h3 font-heading font-bold text-neutral-white">Visitor #{visitorId.slice(0, 8)}</h1>
          {isHuman && <StatusBadge tone="info" label="Human" />}
          {conversation.escalated && <StatusBadge tone="warning" label="Escalated" />}
          {!isHuman && !conversation.escalated && <StatusBadge tone="neutral" label="Bot" />}
        </div>
      </div>

      <div className={cn(cardVariants.base, 'flex max-w-2xl flex-col gap-4')}>
        <div ref={scrollRef} className="flex max-h-[28rem] flex-col gap-3 overflow-y-auto">
          {conversation.messages.length === 0 ? (
            <p className="text-body-sm font-body text-neutral-silver">No messages yet.</p>
          ) : (
            conversation.messages.map((m) => (
              <MessageBubble key={m.id} message={toChatMessage(m)} onQuickReply={() => {}} disabled />
            ))
          )}
        </div>

        {!isHuman && (
          <button
            type="button"
            onClick={takeOver}
            disabled={isTakingOver}
            className={cn(buttonVariants.primary, spacing.buttonPadding, 'self-start text-body-sm')}
          >
            {isTakingOver ? 'Taking over…' : 'Take over conversation'}
          </button>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void sendReply();
              }
            }}
            disabled={!isHuman || isSending}
            placeholder={isHuman ? 'Reply as a live agent…' : 'Take over the conversation to reply'}
            className={cn(inputVariants.base, 'flex-1')}
          />
          <button
            type="button"
            onClick={sendReply}
            disabled={!isHuman || isSending || !draft.trim()}
            className={cn(buttonVariants.primary, spacing.buttonPadding, 'text-body-sm')}
          >
            Send
          </button>
        </div>
        {error && <p className="text-body-sm font-body text-error">{error}</p>}
      </div>
    </div>
  );
}
