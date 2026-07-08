'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Send, Square, X } from 'lucide-react';
import { accessibility, cn, inputVariants } from '@/design';
import type { MessageAttachment } from '@/types/chat';
import type { useChatAssistant } from '@/hooks/useChatAssistant';
import FileUploadButton from './FileUploadButton';
import VoiceMicButton from './VoiceMicButton';

const VoicePanel = dynamic(() => import('./VoicePanel'), { ssr: false });

interface ComposerProps {
  chat: ReturnType<typeof useChatAssistant>;
}

export default function Composer({ chat }: ComposerProps) {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [voiceActivated, setVoiceActivated] = useState(false);

  const isStreaming = chat.state.status === 'streaming';

  function handleSend() {
    if (!text.trim() || isStreaming) return;
    void chat.sendMessage(text, attachments.length > 0 ? attachments : undefined);
    setText('');
    setAttachments([]);
  }

  return (
    <div>
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-neutral-titanium/20 bg-bg-primary px-4 pt-3">
          {attachments.map((attachment) => (
            <span
              key={attachment.name}
              className="flex items-center gap-1 rounded-md border border-neutral-titanium/30 px-2 py-1 text-caption font-body text-neutral-silver"
            >
              {attachment.name}
              <button
                type="button"
                aria-label={`Remove ${attachment.name}`}
                onClick={() => setAttachments((prev) => prev.filter((a) => a.name !== attachment.name))}
              >
                <X size={12} aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 border-t border-neutral-titanium/20 bg-bg-primary px-4 py-3">
        <FileUploadButton onAttach={(a) => setAttachments((prev) => [...prev, a])} disabled={isStreaming} />

        {voiceActivated ? (
          <button
            type="button"
            aria-label="Turn off voice mode"
            onClick={() => setVoiceActivated(false)}
            className={cn(accessibility.focusRing, 'flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent-primary/15 text-accent-primary')}
          >
            <X size={16} aria-hidden="true" />
          </button>
        ) : (
          <VoiceMicButton onClick={() => setVoiceActivated(true)} />
        )}

        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              handleSend();
            }
          }}
          rows={1}
          placeholder="Ask about products, orders, warranty..."
          aria-label="Message"
          className={cn(inputVariants.base, 'max-h-32 resize-none py-2')}
        />

        {isStreaming ? (
          <button
            type="button"
            aria-label="Stop generating"
            onClick={chat.stopGenerating}
            className={cn(accessibility.focusRing, 'flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-error/10 text-error')}
          >
            <Square size={16} aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            aria-label="Send message"
            onClick={handleSend}
            disabled={!text.trim()}
            className={cn(accessibility.focusRing, 'flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent-primary text-bg-primary disabled:opacity-40')}
          >
            <Send size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      {voiceActivated && <VoicePanel chat={chat} onDeactivate={() => setVoiceActivated(false)} />}
    </div>
  );
}
