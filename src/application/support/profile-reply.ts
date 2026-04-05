import { PersonasService } from '../../modules/personas/personas.service.js';
import type { PlannerPersonaId, WeddingProfileRecord } from '../../modules/state/state.types.js';

const personas = new PersonasService();

export function buildProfileReply(plannerId: PlannerPersonaId, profile: WeddingProfileRecord): string {
  const persona = personas.get(plannerId);
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
