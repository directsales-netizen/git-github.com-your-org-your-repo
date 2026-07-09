import Link from 'next/link';
import { ShieldAlert, Headset } from 'lucide-react';
import { getAdminSession } from '@/lib/admin/getSession';
import { logActivity } from '@/lib/admin/activityLog';
import { getAllLiveConversations } from '@/lib/admin/liveChatStore';
import PageHeader from '@/components/admin/PageHeader';
import EmptyState from '@/components/admin/EmptyState';
import StatusBadge from '@/components/admin/StatusBadge';

export default async function LiveChatTakeoverPage() {
  // src/proxy.ts already guarantees a valid admin session before this page
  // renders; this route additionally requires SuperAdmin specifically —
  // same restricted-notice pattern as /admin/visitor-analytics.
  const session = await getAdminSession();

  if (!session || session.role !== 'SuperAdmin') {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Live Chat Takeover" description="Restricted to SuperAdmin accounts." />
        <EmptyState
          icon={ShieldAlert}
          title="SuperAdmin access required"
          description="Taking over live customer chats is restricted to SuperAdmin accounts. Contact a SuperAdmin if you need this."
        />
      </div>
    );
  }

  const conversations = await getAllLiveConversations();
  await logActivity({ actor: session.sub, action: 'view', target: 'live chat', detail: `${conversations.length} conversations` });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Live Chat Takeover"
        description="Live customer conversations with the AI assistant. Take over any conversation to reply as a human agent instead of the bot."
      />

      {conversations.length === 0 ? (
        <EmptyState icon={Headset} title="No live conversations yet" description="Conversations appear here as soon as a visitor opens the chat widget." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-neutral-titanium/20">
          <table className="w-full text-left text-body-sm font-body">
            <thead className="bg-bg-secondary text-caption font-semibold uppercase tracking-wide text-neutral-titanium">
              <tr>
                <th className="px-4 py-3">Visitor</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last message</th>
                <th className="px-4 py-3">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-titanium/10">
              {conversations.map((convo) => {
                const lastMessage = convo.messages[convo.messages.length - 1];
                return (
                  <tr key={convo.visitorId} className="hover:bg-bg-secondary">
                    <td className="px-4 py-3">
                      <Link href={`/admin/chatbot/live/${convo.visitorId}`} className="text-accent-primary hover:underline">
                        Visitor #{convo.visitorId.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {convo.mode === 'human' && <StatusBadge tone="info" label="Human" />}
                        {convo.escalated && <StatusBadge tone="warning" label="Escalated" />}
                        {convo.mode === 'bot' && !convo.escalated && <StatusBadge tone="neutral" label="Bot" />}
                      </div>
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-neutral-silver">{lastMessage?.text ?? '—'}</td>
                    <td className="px-4 py-3 text-neutral-silver">{new Date(convo.updatedAt).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
