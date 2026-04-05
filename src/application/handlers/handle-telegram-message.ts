import { PersonasService } from '../../modules/personas/personas.service.js';
import { WorkspaceStateGateway } from '../../modules/state/workspace-state.gateway.js';
import { nowIso } from '../../shared/time.js';
import { AssignPlannerPersonaCommand } from '../commands/planners/assign-planner-persona.command.js';
import { UpdateWeddingProfileCommand } from '../commands/profiles/update-wedding-profile.command.js';
import { GetSummaryQuery } from '../queries/summaries/get-summary.query.js';
import { extractProfilePatch } from '../support/profile-extractor.js';
import { buildProfileReply } from '../support/profile-reply.js';
import type { TelegramInboundInput } from '../support/telegram-inbound.types.js';

export class HandleTelegramMessage {
  constructor(
    private readonly state = new WorkspaceStateGateway(),
    private readonly personas = new PersonasService(),
    private readonly assignPlannerPersona = new AssignPlannerPersonaCommand(),
    private readonly updateWeddingProfile = new UpdateWeddingProfileCommand(),
    private readonly getSummary = new GetSummaryQuery()
  ) {}

  async execute(input: TelegramInboundInput): Promise<{ reply: string; workspaceId: string }> {
    let identity = await this.state.findUserByTelegram(input.platformUserId);
    if (!identity) {
      const userId = await this.state.createUserWithTelegramIdentity(input.displayName, input.platformUserId, input.platformChatId, input.username);
      identity = { userId, chatId: input.platformChatId };
    }

    const workspaceId = await this.state.findOrCreateActiveWorkspace(identity.userId);
    await this.state.appendConversationMessage(workspaceId, 'telegram-main', {
      ts: nowIso(),
      direction: 'inbound',
      platform: 'telegram',
      text: input.text
    });

    const lower = input.text.toLowerCase();
    let reply = '';

    if (lower.includes('mina')) {
      reply = (await this.assignPlannerPersona.execute(workspaceId, 'mina')).reply;
    } else if (lower.includes('luna')) {
      reply = (await this.assignPlannerPersona.execute(workspaceId, 'luna')).reply;
    } else if (lower.includes('tóm tắt') || lower.includes('tom tat') || lower.includes('summary')) {
      reply = (await this.getSummary.execute(workspaceId)).summary;
    } else {
      const bundle = await this.state.getWorkspaceBundle(workspaceId);
      const patch = extractProfilePatch(lower, bundle.profile);
      if (patch) {
        const result = await this.updateWeddingProfile.execute(workspaceId, patch);
        reply = buildProfileReply(result.plannerPersonaId, result.profile);
      } else {
        const persona = this.personas.get(bundle.planner.plannerPersonaId);
        reply = `${persona.displayName} đây. Hiện em có thể giúp anh/chị chọn planner, ghi nhận ngày cưới, thành phố, ngân sách, số khách, và tạo checklist ban đầu. Anh/chị thử nhắn kiểu: “Cưới tháng 12 ở Hà Nội, ngân sách 300 triệu”.`;
      }
    }

    await this.state.appendConversationMessage(workspaceId, 'telegram-main', {
      ts: nowIso(),
      direction: 'outbound',
      platform: 'telegram',
      text: reply
    });

    return { reply, workspaceId };
  }
}
