import type { PlannerPersonaId } from '../state/state.types.js';

export interface PersonaView {
  id: PlannerPersonaId;
  displayName: string;
  styleLabel: string;
  intro: string;
}

const PERSONAS: Record<PlannerPersonaId, PersonaView> = {
  mina: {
    id: 'mina',
    displayName: 'Mina',
    styleLabel: 'Tiết kiệm',
    intro: 'Mina ưu tiên tối ưu chi phí, khóa các hạng mục must-have trước và tránh lãng phí.'
  },
  luna: {
    id: 'luna',
    displayName: 'Luna',
    styleLabel: 'Lãng mạn',
    intro: 'Luna ưu tiên cảm xúc, concept và trải nghiệm đáng nhớ cho ngày cưới.'
  }
};

export class PersonasService {
  list(): PersonaView[] {
    return Object.values(PERSONAS);
  }

  get(id: PlannerPersonaId): PersonaView {
    return PERSONAS[id];
  }
}
