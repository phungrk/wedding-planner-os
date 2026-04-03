import { ChecklistService } from '../checklist/checklist.service.js';
import { PersonasService } from '../personas/personas.service.js';
import { WorkspaceStateGateway } from '../state/workspace-state.gateway.js';
import { nowIso } from '../../shared/time.js';
import type { PlannerPersonaId, WeddingProfileRecord } from '../state/state.types.js';

interface TelegramInboundInput {
  platformUserId: string;
  platformChatId: string;
  displayName: string;
  username?: string;
  text: string;
}

export class PlannerService {
  constructor(
    private readonly state = new WorkspaceStateGateway(),
    private readonly personas = new PersonasService(),
    private readonly checklist = new ChecklistService()
  ) {}

  async handleTelegramMessage(input: TelegramInboundInput): Promise<{ reply: string; workspaceId: string }> {
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
      await this.state.assignPlanner(workspaceId, 'mina');
      await this.state.appendWorkspaceEvent(workspaceId, { ts: nowIso(), type: 'planner_assigned', plannerPersonaId: 'mina' });
      reply = `Đã chuyển sang planner Mina. ${this.personas.get('mina').intro}`;
    } else if (lower.includes('luna')) {
      await this.state.assignPlanner(workspaceId, 'luna');
      await this.state.appendWorkspaceEvent(workspaceId, { ts: nowIso(), type: 'planner_assigned', plannerPersonaId: 'luna' });
      reply = `Đã chuyển sang planner Luna. ${this.personas.get('luna').intro}`;
    } else if (lower.includes('tóm tắt') || lower.includes('tom tat') || lower.includes('summary')) {
      const bundle = await this.state.getWorkspaceBundle(workspaceId);
      reply = bundle.summary;
    } else {
      const bundle = await this.state.getWorkspaceBundle(workspaceId);
      const patch = this.extractProfilePatch(lower, bundle.profile);
      if (patch) {
        const nextProfile = await this.state.updateProfile(workspaceId, patch);
        await this.state.appendWorkspaceEvent(workspaceId, { ts: nowIso(), type: 'profile_updated', fields: Object.keys(patch) });

        if (bundle.tasks.items.length === 0) {
          const tasks = this.checklist.buildStarterChecklist(bundle.planner.plannerPersonaId);
          await this.state.replaceTasks(workspaceId, tasks);
          await this.state.appendWorkspaceEvent(workspaceId, { ts: nowIso(), type: 'starter_checklist_generated', plannerPersonaId: bundle.planner.plannerPersonaId });
        }

        reply = this.buildProfileReply(bundle.planner.plannerPersonaId, nextProfile);
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

  private extractProfilePatch(lower: string, current: WeddingProfileRecord): Partial<WeddingProfileRecord> | null {
    const patch: Partial<WeddingProfileRecord> = {};

    if (lower.includes('hà nội') || lower.includes('ha noi')) {
      patch.city = 'Hà Nội';
      patch.confidence = { ...(patch.confidence ?? {}), city: 'confirmed' };
    }
    if (lower.includes('hồ chí minh') || lower.includes('ho chi minh') || lower.includes('sài gòn') || lower.includes('sai gon')) {
      patch.city = 'TP.HCM';
      patch.confidence = { ...(patch.confidence ?? {}), city: 'confirmed' };
    }

    const budgetMatch = lower.match(/(\d{2,4})\s*triệu/);
    if (budgetMatch) {
      patch.budgetTarget = Number(budgetMatch[1]) * 1_000_000;
      patch.confidence = { ...(patch.confidence ?? {}), budgetTarget: 'draft' };
    }

    const guestMatch = lower.match(/(\d{2,4})\s*(khách|nguoi|người)/);
    if (guestMatch) {
      patch.guestTarget = Number(guestMatch[1]);
      patch.confidence = { ...(patch.confidence ?? {}), guestTarget: 'draft' };
    }

    const monthMatch = lower.match(/tháng\s*(\d{1,2})/);
    if (monthMatch) {
      const month = String(monthMatch[1]).padStart(2, '0');
      const year = current.eventDate?.slice(0, 4) ?? String(new Date().getUTCFullYear());
      patch.eventDate = `${year}-${month}-01`;
      patch.confidence = { ...(patch.confidence ?? {}), eventDate: 'draft' };
    }

    return Object.keys(patch).length > 0 ? patch : null;
  }

  private buildProfileReply(plannerId: PlannerPersonaId, profile: WeddingProfileRecord): string {
    const persona = this.personas.get(plannerId);
    return [
      `${persona.displayName} đã ghi nhận thông tin ban đầu rồi.`,
      `- Thành phố: ${profile.city ?? 'chưa rõ'}`,
      `- Ngày cưới: ${profile.eventDate ?? 'chưa rõ'}`,
      `- Ngân sách: ${profile.budgetTarget ? `${Math.round(profile.budgetTarget / 1_000_000)} triệu` : 'chưa rõ'}`,
      `- Số khách: ${profile.guestTarget ?? 'chưa rõ'}`,
      '',
      'Em đã tạo checklist khởi động nếu chưa có. Tiếp theo anh/chị có thể hỏi: “tóm tắt kế hoạch hiện tại”.'
    ].join('\n');
  }
}
