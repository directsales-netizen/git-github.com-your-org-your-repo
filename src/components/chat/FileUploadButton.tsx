'use client';

import { useRef } from 'react';
import { Paperclip } from 'lucide-react';
import { accessibility, cn } from '@/design';
import type { MessageAttachment } from '@/types/chat';

interface FileUploadButtonProps {
  onAttach: (attachment: MessageAttachment) => void;
  disabled?: boolean;
}

export default function FileUploadButton({ onAttach, disabled }: FileUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <button
        type="button"
        aria-label="Attach a file"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-neutral-silver transition-colors duration-300 hover:bg-bg-secondary hover:text-accent-primary disabled:opacity-50',
          accessibility.focusRing
        )}
      >
        <Paperclip size={18} aria-hidden="true" />
      </button>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onAttach({ name: file.name, size: file.size, type: file.type });
          event.target.value = '';
        }}
      />
    </>
  );
}
