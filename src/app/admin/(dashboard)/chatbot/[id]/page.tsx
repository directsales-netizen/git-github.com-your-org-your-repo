import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getConversation } from '@/lib/admin/chatConversations';
import { cn } from '@/design';
import StatusBadge from '@/components/admin/StatusBadge';

export default async function AdminChatbotTranscriptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const conversation = await getConversation(id);
  if (!conversation) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/chatbot" className="inline-flex items-center gap-1.5 text-body-sm font-body text-accent-primary hover:underline">
          <ArrowLeft size={14} aria-hidden="true" />
          Back to conversations
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-h3 font-heading font-bold text-neutral-white">{conversation.visitorLabel}</h1>
          {conversation.escalated ? <StatusBadge tone="warning" label="Escalated" /> : <StatusBadge tone="success" label="Resolved" />}
        </div>
        <p className="mt-1 text-body-sm font-body text-neutral-silver">Started {new Date(conversation.startedAt).toLocaleString()}</p>
      </div>

      <div className="flex max-w-2xl flex-col gap-3">
        {conversation.messages.map((message) => (
          <div key={message.id} className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div
              className={cn(
                'max-w-[80%] rounded-lg px-4 py-2.5 text-body-sm font-body',
                message.role === 'user' ? 'bg-accent-primary text-bg-primary' : 'bg-bg-secondary text-neutral-light-gray'
              )}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
