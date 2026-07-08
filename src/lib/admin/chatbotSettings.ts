import type { ChatbotSettings } from '@/types/admin';
import { globalBox } from '@/lib/globalStore';

const settingsBox = globalBox('chatbotSettings', (): ChatbotSettings => ({
  greetingEnabled: true,
  voiceEnabled: true,
  escalationEmail: 'support@premiumtechnoir.com',
}));

export async function getChatbotSettings(): Promise<ChatbotSettings> {
  return settingsBox.current;
}

export async function updateChatbotSettings(patch: Partial<ChatbotSettings>): Promise<ChatbotSettings> {
  settingsBox.current = { ...settingsBox.current, ...patch };
  return settingsBox.current;
}
