'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import { Pencil } from 'lucide-react';
import { cn } from '@/design';
import { useEditMode } from '@/components/EditModeProvider';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface InlineEditableTextProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  as?: 'h1' | 'p' | 'span';
  multiline?: boolean;
  className?: string;
}

/**
 * Renders plain text (identical to today) unless the viewer is an editor+
 * admin who has explicitly turned on Edit Page mode (see EditModeProvider) —
 * every ordinary visitor and every admin who hasn't opted in gets zero
 * difference in DOM or behavior.
 */
export default function InlineEditableText({ value, onSave, as = 'span', multiline = false, className }: InlineEditableTextProps) {
  const { canEdit, editModeOn } = useEditMode();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const lastSaved = useRef(value);

  if (!canEdit || !editModeOn) {
    const Tag = as;
    return <Tag className={className}>{value}</Tag>;
  }

  function startEditing() {
    setDraft(lastSaved.current);
    setIsEditing(true);
  }

  async function commit() {
    setIsEditing(false);
    if (draft === lastSaved.current) return;

    setStatus('saving');
    setError(null);
    try {
      await onSave(draft);
      lastSaved.current = draft;
      setStatus('saved');
      setTimeout(() => setStatus((s) => (s === 'saved' ? 'idle' : s)), 2000);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Unable to save.');
    }
  }

  function cancel() {
    setDraft(lastSaved.current);
    setIsEditing(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      cancel();
    } else if (event.key === 'Enter' && (!multiline || !event.shiftKey)) {
      event.preventDefault();
      event.currentTarget.blur();
    }
  }

  if (isEditing) {
    const inputClassName = cn(className, 'w-full rounded-md border border-accent-primary bg-bg-primary/80 px-2 py-1 outline-none');
    // stopPropagation on click/mousedown guards against being nested inside
    // a Link (e.g. the hero CTA button) — otherwise clicking into the field
    // to position the cursor would also trigger the anchor's navigation.
    return multiline ? (
      <textarea
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        rows={3}
        className={inputClassName}
      />
    ) : (
      <input
        autoFocus
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        className={inputClassName}
      />
    );
  }

  const Tag = as;
  return (
    <span className="group/editable relative inline-block w-full align-top">
      <Tag className={className}>{value}</Tag>
      <button
        type="button"
        onClick={(event) => {
          // Guards against being nested inside a Link (e.g. the hero CTA
          // button) — without this, clicking the pencil would also navigate.
          event.preventDefault();
          event.stopPropagation();
          startEditing();
        }}
        aria-label="Edit this text"
        className="absolute -right-7 top-1 rounded-md p-1 text-accent-primary opacity-0 transition-opacity hover:bg-accent-primary/10 group-hover/editable:opacity-100"
      >
        <Pencil size={14} aria-hidden="true" />
      </button>
      {status === 'saving' && <span className="ml-2 text-caption font-body text-neutral-silver">Saving…</span>}
      {status === 'saved' && <span className="ml-2 text-caption font-body text-success">Saved</span>}
      {status === 'error' && <span className="ml-2 text-caption font-body text-error">{error}</span>}
    </span>
  );
}
