'use client';

import { useState } from 'react';
import { adminFetch, extractAdminErrorMessage } from '@/lib/admin/adminFetch';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ChatConversation } from '@/lib/admin/chatConversations';
import type { ChatbotSettings } from '@/types/admin';
import { buttonVariants, cardVariants, cn, spacing } from '@/design';
import DataTable, { type Column } from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import { TextField, ToggleField } from '@/components/admin/FormFields';

export default function ChatbotClient({ conversations, initialSettings }: { conversations: ChatConversation[]; initialSettings: ChatbotSettings }) {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveSettings() {
    setIsSaving(true);
    setError(null);
    const response = await adminFetch('/api/admin/chatbot/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (response.ok) {
      setSettings(await response.json());
      router.refresh();
    } else {
      setError(await extractAdminErrorMessage(response, 'Unable to save settings.'));
    }
    setIsSaving(false);
  }

  const columns: Column<ChatConversation>[] = [
    {
      key: 'visitorLabel',
      header: 'Visitor',
      sortValue: (c) => c.visitorLabel,
      render: (c) => (
        <Link href={`/admin/chatbot/${c.id}`} className="font-medium text-accent-primary hover:underline">
          {c.visitorLabel}
        </Link>
      ),
    },
    { key: 'startedAt', header: 'Started', sortValue: (c) => c.startedAt, render: (c) => new Date(c.startedAt).toLocaleString() },
    { key: 'messageCount', header: 'Messages', sortValue: (c) => c.messages.length, render: (c) => c.messages.length },
    {
      key: 'escalated',
      header: 'Escalated',
      render: (c) => (c.escalated ? <StatusBadge tone="warning" label="Escalated" /> : <StatusBadge tone="success" label="Resolved" />),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <DataTable
        columns={columns}
        rows={conversations}
        getRowId={(c) => c.id}
        searchable
        searchPlaceholder="Search conversations…"
        searchKeys={['visitorLabel']}
        emptyMessage="No conversations yet."
      />

      <div className={cn(cardVariants.base, 'max-w-lg')}>
        <h2 className="text-h6 font-heading font-semibold text-neutral-white">Assistant settings</h2>
        <div className="mt-4 flex flex-col gap-3">
          <ToggleField id="greeting" label="Greeting enabled" checked={settings.greetingEnabled} onChange={(v) => setSettings((s) => ({ ...s, greetingEnabled: v }))} />
          <ToggleField id="voice" label="Voice responses enabled" checked={settings.voiceEnabled} onChange={(v) => setSettings((s) => ({ ...s, voiceEnabled: v }))} />
          <TextField id="escalationEmail" label="Escalation email" type="email" value={settings.escalationEmail} onChange={(v) => setSettings((s) => ({ ...s, escalationEmail: v }))} />
        </div>
        <button
          type="button"
          onClick={saveSettings}
          disabled={isSaving}
          className={cn(buttonVariants.primary, spacing.buttonPadding, 'mt-4 text-body-sm')}
        >
          {isSaving ? 'Saving…' : 'Save settings'}
        </button>
        {error && <p className="mt-2 text-caption font-body text-error">{error}</p>}
      </div>
    </div>
  );
}
