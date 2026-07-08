import { getAllConversations } from '@/lib/admin/chatConversations';
import { getChatbotSettings } from '@/lib/admin/chatbotSettings';
import PageHeader from '@/components/admin/PageHeader';
import ChatbotClient from './ChatbotClient';

export default async function AdminChatbotPage() {
  const [conversations, settings] = await Promise.all([getAllConversations(), getChatbotSettings()]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="AI Chatbot"
        description="Review past conversations and configure assistant behavior. Transcripts below are a seeded demo history — the live /api/chat endpoint is stateless and doesn't persist sessions yet."
      />
      <ChatbotClient conversations={conversations} initialSettings={settings} />
    </div>
  );
}
