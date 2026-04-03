import type { FastifyInstance } from 'fastify';
import { PlannerService } from '../planner/planner.service.js';
import { TelegramSender } from './telegram.sender.js';
import type { TelegramUpdate } from './telegram.types.js';
import { extractTelegramMessage } from './telegram.webhook.js';

const planner = new PlannerService();
const sender = new TelegramSender();

export async function registerTelegramRoutes(app: FastifyInstance): Promise<void> {
  app.post('/telegram/webhook', async (request, reply) => {
    const body = request.body as TelegramUpdate;
    const extracted = extractTelegramMessage(body);

    if (!extracted) {
      return reply.send({ ok: true, ignored: true });
    }

    const result = await planner.handleTelegramMessage(extracted);

    try {
      await sender.sendText(extracted.platformChatId, result.reply);
    } catch (error) {
      request.log.error({ err: error }, 'Failed to send Telegram reply');
    }

    return reply.send({ ok: true, reply: result.reply, workspaceId: result.workspaceId, deliveredToTelegram: true });
  });
}
