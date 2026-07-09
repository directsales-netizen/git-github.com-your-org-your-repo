import { globalSingleton, globalBox } from '@/lib/globalStore';
import type { LiveConversation, LiveChatMessage, LiveChatMode } from '@/types/admin';

/**
 * In-memory, globalThis-backed store for live chat takeover — same pattern
 * and same accepted limitation as src/lib/admin/chatbotSettings.ts and every
 * other admin mock-data module: resets on server restart, and on serverless
 * deployments (Vercel prod) separate requests can land on separate function
 * instances with no shared memory at all. That's more consequential here
 * than elsewhere, since this feature's entire premise is a customer's chat
 * POSTs and an admin's polling reads/writes seeing the same process memory.
 */
const CONVERSATIONS = globalSingleton('liveChatConversations', () => new Map<string, LiveConversation>());
const nextMsgIdBox = globalBox('liveChatNextMsgId', () => 1);

function newMessage(role: LiveChatMessage['role'], text: string, authoredBy: LiveChatMessage['authoredBy']): LiveChatMessage {
  return { id: `lcm-${nextMsgIdBox.current++}`, role, text, authoredBy, createdAt: Date.now() };
}

export async function getOrCreateLiveConversation(visitorId: string): Promise<LiveConversation> {
  let convo = CONVERSATIONS.get(visitorId);
  if (!convo) {
    const now = Date.now();
    convo = { visitorId, mode: 'bot', escalated: false, createdAt: now, updatedAt: now, messages: [] };
    CONVERSATIONS.set(visitorId, convo);
  }
  return convo;
}

export async function getLiveConversation(visitorId: string): Promise<LiveConversation | null> {
  return CONVERSATIONS.get(visitorId) ?? null;
}

export async function getAllLiveConversations(): Promise<LiveConversation[]> {
  return [...CONVERSATIONS.values()].sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function appendVisitorMessage(visitorId: string, text: string): Promise<LiveChatMessage> {
  const convo = await getOrCreateLiveConversation(visitorId);
  const message = newMessage('user', text, 'visitor');
  convo.messages.push(message);
  convo.updatedAt = message.createdAt;
  return message;
}

export async function appendBotMessage(visitorId: string, text: string): Promise<LiveChatMessage | null> {
  if (!text.trim()) return null;
  const convo = await getOrCreateLiveConversation(visitorId);
  const message = newMessage('assistant', text, 'bot');
  convo.messages.push(message);
  convo.updatedAt = message.createdAt;
  return message;
}

export async function appendAdminMessage(visitorId: string, text: string, adminEmail: string): Promise<LiveChatMessage> {
  const convo = await getOrCreateLiveConversation(visitorId);
  const message = newMessage('assistant', text, 'admin');
  convo.messages.push(message);
  convo.updatedAt = message.createdAt;
  if (convo.mode !== 'human') {
    convo.mode = 'human';
    convo.takenOverBy = adminEmail;
    convo.takenOverAt = message.createdAt;
  }
  return message;
}

export async function setMode(visitorId: string, mode: LiveChatMode, adminEmail?: string): Promise<LiveConversation> {
  const convo = await getOrCreateLiveConversation(visitorId);
  convo.mode = mode;
  convo.updatedAt = Date.now();
  if (mode === 'human') {
    convo.takenOverBy = adminEmail;
    convo.takenOverAt = convo.updatedAt;
  }
  return convo;
}

/** Returns true only the first time a conversation transitions into escalated — callers use this to dedup the escalation email. */
export async function markEscalated(visitorId: string): Promise<boolean> {
  const convo = await getOrCreateLiveConversation(visitorId);
  if (convo.escalated) return false;
  convo.escalated = true;
  convo.escalatedAt = Date.now();
  convo.updatedAt = convo.escalatedAt;
  return true;
}

/** Admin-authored messages the widget hasn't seen yet — the polling contract's cursor is `createdAt`. */
export async function getAdminMessagesSince(visitorId: string, afterMs: number): Promise<LiveChatMessage[]> {
  const convo = await getLiveConversation(visitorId);
  if (!convo) return [];
  return convo.messages.filter((m) => m.authoredBy === 'admin' && m.createdAt > afterMs);
}
