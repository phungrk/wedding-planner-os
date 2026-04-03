import type { TelegramUpdate } from './telegram.types.js';

export function extractTelegramMessage(body: TelegramUpdate): {
  text: string;
  platformUserId: string;
  platformChatId: string;
  displayName: string;
  username?: string;
} | null {
  const message = body.message;

  if (!message?.text || !message.from?.id || !message.chat?.id) {
    return null;
  }

  return {
    text: message.text,
    platformUserId: String(message.from.id),
    platformChatId: String(message.chat.id),
    displayName: message.from.first_name ?? 'Unknown',
    username: message.from.username
  };
}
