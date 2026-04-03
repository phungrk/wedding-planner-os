import { ensureDir, writeJsonAtomic, writeTextAtomic } from '../modules/state/state.io.js';
import { personasDir, templatesDir } from '../modules/state/state.paths.js';

await ensureDir(personasDir());
await ensureDir(templatesDir());

for (const persona of [
  {
    id: 'mina',
    displayName: 'Mina',
    styleLabel: 'Tiết kiệm',
    tone: 'practical',
    planningPrinciples: ['prioritize must-have', 'avoid waste', 'optimize cost-effectiveness'],
    checklistTemplateId: 'budget-conscious-v1',
    summaryStyle: 'clear-and-concise',
    active: true,
    prompt: '# Mina\n\nƯu tiên tối ưu chi phí, rõ ràng, tránh lãng phí.\n'
  },
  {
    id: 'luna',
    displayName: 'Luna',
    styleLabel: 'Lãng mạn',
    tone: 'warm',
    planningPrinciples: ['optimize emotion', 'protect guest experience', 'support romantic concepts'],
    checklistTemplateId: 'romantic-v1',
    summaryStyle: 'warm-and-clear',
    active: true,
    prompt: '# Luna\n\nƯu tiên cảm xúc, concept và trải nghiệm đáng nhớ.\n'
  }
]) {
  await ensureDir(`${personasDir()}/${persona.id}`);
  await writeJsonAtomic(`${personasDir()}/${persona.id}/persona.json`, { ...persona, prompt: undefined, schemaVersion: 1 });
  await writeTextAtomic(`${personasDir()}/${persona.id}/prompt.md`, persona.prompt);
}

await ensureDir(`${templatesDir()}/checklists`);
await writeJsonAtomic(`${templatesDir()}/checklists/budget-conscious-v1.json`, {
  schemaVersion: 1,
  id: 'budget-conscious-v1',
  title: 'Budget Conscious Starter Checklist',
  items: [
    { title: 'Chốt ngân sách mục tiêu', category: 'budget', priority: 'high' },
    { title: 'Ước lượng số khách ban đầu', category: 'guestlist', priority: 'high' },
    { title: 'Shortlist 3 venue phù hợp', category: 'venue', priority: 'high' }
  ]
});

await writeJsonAtomic(`${templatesDir()}/checklists/romantic-v1.json`, {
  schemaVersion: 1,
  id: 'romantic-v1',
  title: 'Romantic Starter Checklist',
  items: [
    { title: 'Chốt concept cảm xúc tổng thể', category: 'concept', priority: 'high' },
    { title: 'Ước lượng số khách ban đầu', category: 'guestlist', priority: 'high' },
    { title: 'Shortlist venue hợp concept', category: 'venue', priority: 'high' }
  ]
});

console.log('Seeded personas and templates');
