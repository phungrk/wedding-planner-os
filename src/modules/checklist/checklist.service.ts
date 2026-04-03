import { nowIso } from '../../shared/time.js';
import { makeId } from '../../shared/ids.js';
import type { ChecklistTask, PlannerPersonaId, TasksFile } from '../state/state.types.js';

export class ChecklistService {
  buildStarterChecklist(plannerId: PlannerPersonaId): TasksFile {
    const ts = nowIso();
    const common: ChecklistTask[] = [
      { id: makeId('task'), title: 'Chốt ngân sách mục tiêu', category: 'budget', status: 'open', priority: 'high', dueAt: null, createdAt: ts, updatedAt: ts },
      { id: makeId('task'), title: 'Ước lượng số khách ban đầu', category: 'guestlist', status: 'open', priority: 'high', dueAt: null, createdAt: ts, updatedAt: ts },
      { id: makeId('task'), title: 'Shortlist 3 venue phù hợp', category: 'venue', status: 'open', priority: 'high', dueAt: null, createdAt: ts, updatedAt: ts }
    ];

    const extra: ChecklistTask[] = plannerId === 'mina'
      ? [{ id: makeId('task'), title: 'Rà soát hạng mục có thể cắt giảm', category: 'budget', status: 'open', priority: 'medium', dueAt: null, createdAt: ts, updatedAt: ts }]
      : [{ id: makeId('task'), title: 'Phác concept cảm xúc / moodboard cưới', category: 'concept', status: 'open', priority: 'medium', dueAt: null, createdAt: ts, updatedAt: ts }];

    return {
      schemaVersion: 1,
      items: [...common, ...extra]
    };
  }
}
