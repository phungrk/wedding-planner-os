import path from 'node:path';

export const env = {
  port: Number(process.env.PORT ?? 8787),
  dataDir: path.resolve(process.env.DATA_DIR ?? './data'),
  appBaseUrl: process.env.APP_BASE_URL ?? 'http://localhost:8787',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN ?? '',
  telegramWebhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET ?? ''
};
