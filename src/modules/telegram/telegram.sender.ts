import { env } from '../../config/env.js';

interface SendMessagePayload {
  chat_id: string;
  text: string;
}

export class TelegramSender {
  async sendText(chatId: string, text: string): Promise<void> {
    if (!env.telegramBotToken) {
      return;
    }

    const payload: SendMessagePayload = {
      chat_id: chatId,
      text
    };

    const response = await fetch(`https://api.telegram.org/bot${env.telegramBotToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Telegram send failed: ${response.status} ${body}`);
    }
  }
}
