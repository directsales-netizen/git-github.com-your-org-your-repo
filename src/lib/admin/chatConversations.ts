import type { ChatMessage } from '@/types/chat';

/**
 * Seeded historical chat sessions for the admin "AI Chatbot" module.
 * NOT wired to the live /api/chat route — that route is intentionally
 * stateless per-request (see src/lib/chat/generateAssistantReply.ts), so
 * there is nowhere real conversations get persisted today. This dataset
 * exists to make the transcript-review UI genuinely functional to browse.
 */
export interface ChatConversation {
  id: string;
  visitorLabel: string;
  startedAt: string;
  escalated: boolean;
  messages: ChatMessage[];
}

function msg(id: string, role: ChatMessage['role'], text: string, minutesAgo: number): ChatMessage {
  return { id, role, text, blocks: [], createdAt: Date.now() - minutesAgo * 60 * 1000 };
}

const CONVERSATIONS: ChatConversation[] = [
  {
    id: 'conv-1',
    visitorLabel: 'Visitor #4821',
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    escalated: false,
    messages: [
      msg('m1', 'assistant', "Hi! Welcome to Premium TechNoir. What can I help you with today?", 185),
      msg('m2', 'user', 'I need a MacBook for graphic design under $1500', 184),
      msg('m3', 'assistant', 'Based on what you\'re looking for, here\'s what we have in stock.', 184),
    ],
  },
  {
    id: 'conv-2',
    visitorLabel: 'Visitor #4830',
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    escalated: true,
    messages: [
      msg('m1', 'assistant', "Hi! Welcome to Premium TechNoir. What can I help you with today?", 365),
      msg('m2', 'user', 'this is unacceptable, I want to talk to a human right now', 364),
      msg('m3', 'assistant', 'This sounds like it might need a closer look from our team. Let me connect you with a specialist.', 364),
    ],
  },
  {
    id: 'conv-3',
    visitorLabel: 'Jordan Lee',
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    escalated: false,
    messages: [
      msg('m1', 'assistant', "Hi! Welcome to Premium TechNoir. What can I help you with today?", 1565),
      msg('m2', 'user', 'track my order', 1564),
      msg('m3', 'assistant', "Happy to check on that. What's your order number?", 1564),
      msg('m4', 'user', 'PTN-48213', 1563),
      msg('m5', 'assistant', 'Your order is on its way.', 1563),
    ],
  },
  {
    id: 'conv-4',
    visitorLabel: 'Visitor #4790',
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    escalated: false,
    messages: [
      msg('m1', 'assistant', "Hi! Welcome to Premium TechNoir. What can I help you with today?", 2885),
      msg('m2', 'user', "What's your warranty policy?", 2884),
      msg('m3', 'assistant', 'Every device ships with a minimum 30-day warranty covering full functionality.', 2884),
    ],
  },
];

export async function getAllConversations(): Promise<ChatConversation[]> {
  return [...CONVERSATIONS].sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export async function getConversation(id: string): Promise<ChatConversation | null> {
  return CONVERSATIONS.find((c) => c.id === id) ?? null;
}
