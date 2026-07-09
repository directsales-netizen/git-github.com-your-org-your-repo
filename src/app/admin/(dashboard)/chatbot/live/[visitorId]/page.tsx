import { notFound } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import { getAdminSession } from '@/lib/admin/getSession';
import { getLiveConversation } from '@/lib/admin/liveChatStore';
import PageHeader from '@/components/admin/PageHeader';
import EmptyState from '@/components/admin/EmptyState';
import LiveChatDetailClient from './LiveChatDetailClient';

export default async function LiveChatDetailPage({ params }: { params: Promise<{ visitorId: string }> }) {
  const session = await getAdminSession();

  if (!session || session.role !== 'SuperAdmin') {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Live Chat Takeover" description="Restricted to SuperAdmin accounts." />
        <EmptyState
          icon={ShieldAlert}
          title="SuperAdmin access required"
          description="Taking over live customer chats is restricted to SuperAdmin accounts."
        />
      </div>
    );
  }

  const { visitorId } = await params;
  const conversation = await getLiveConversation(visitorId);
  if (!conversation) notFound();

  return <LiveChatDetailClient visitorId={visitorId} initialConversation={conversation} />;
}
