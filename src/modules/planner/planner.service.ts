import { HandleTelegramMessage } from '../../application/handlers/handle-telegram-message.js';
import type { TelegramInboundInput } from '../../application/support/telegram-inbound.types.js';

export class PlannerService {
  constructor(private readonly handleTelegramMessage = new HandleTelegramMessage()) {}

  async handleTelegramMessageFromTelegram(input: TelegramInboundInput): Promise<{ reply: string; workspaceId: string }> {
    return this.handleTelegramMessage.execute(input);
  }
}
