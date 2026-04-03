import type { FastifyInstance } from 'fastify';
import { PlannerService } from '../planner/planner.service.js';

const planner = new PlannerService();

interface TelegramUpdate {
  message?: {
    text?: string;
    from?: {
      id: number;
      first_name?: string;
      username?: string;
    };
    chat?: {
      id: number;
    };
  };
}

export async function registerTelegramRoutes(app: FastifyInstance): Promise<void> {
  app.post('/telegram/webhook', async (request, reply) => {
    const body = request.body as TelegramUpdate;
    const message = body.message;

    if (!message?.text || !message.from?.id || !message.chat?.id) {
      return reply.send({ ok: true, ignored: true });
    }

    const result = await planner.handleTelegramMessage({
      platformUserId: String(message.from.id),
      platformChatId: String(message.chat.id),
      displayName: message.from.first_name ?? 'Unknown',
      username: message.from.username,
      text: message.text
    });

    return reply.send({ ok: true, reply: result.reply, workspaceId: result.workspaceId });
  });
}
