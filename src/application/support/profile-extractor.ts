import type { WeddingProfileRecord } from '../../modules/state/state.types.js';

export function extractProfilePatch(lower: string, current: WeddingProfileRecord): Partial<WeddingProfileRecord> | null {
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
