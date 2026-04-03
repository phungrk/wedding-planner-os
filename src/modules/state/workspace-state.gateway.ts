import { makeId } from '../../shared/ids.js';
import { nowIso } from '../../shared/time.js';
import { ensureDir, exists, readJsonFile, writeJsonAtomic, writeTextAtomic } from './state.io.js';
import { systemFile, userDir, userFile, weddingConversationFile, weddingDir, weddingFile } from './state.paths.js';
import type {
  IdentitiesFile,
  IndexFile,
  LatestStateRecord,
  PlannerAssignmentRecord,
  PlannerPersonaId,
  TasksFile,
  UserRecord,
  WeddingProfileRecord,
  WorkspaceRecord
} from './state.types.js';

const INDEX_DEFAULT: IndexFile = {
  schemaVersion: 1,
  activeWeddingByUserId: {}
};

export class WorkspaceStateGateway {
  async ensureSystem(): Promise<void> {
    await ensureDir(systemFile('..'));
    if (!(await exists(systemFile('index.json')))) {
      await writeJsonAtomic(systemFile('index.json'), INDEX_DEFAULT);
    }
  }

  async findUserByTelegram(platformUserId: string): Promise<{ userId: string; chatId: string } | null> {
    await this.ensureSystem();
    const usersRoot = systemFile('../users');
    await ensureDir(usersRoot);
    const fs = await import('node:fs/promises');
    const entries = await fs.readdir(usersRoot, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const identitiesPath = userFile(entry.name, 'identities.json');
      if (!(await exists(identitiesPath))) continue;
      const identities = await readJsonFile<IdentitiesFile>(identitiesPath);
      const match = identities.items.find((item) => item.platform === 'telegram' && item.platformUserId === platformUserId);
      if (match) {
        return { userId: entry.name, chatId: match.platformChatId };
      }
    }

    return null;
  }

  async createUserWithTelegramIdentity(displayName: string, platformUserId: string, platformChatId: string, username?: string): Promise<string> {
    const userId = makeId('usr');
    const createdAt = nowIso();
    const user: UserRecord = {
      schemaVersion: 1,
      id: userId,
      displayName,
      role: 'couple',
      timezone: 'UTC',
      createdAt,
      status: 'active'
    };

    const identities: IdentitiesFile = {
      schemaVersion: 1,
      items: [
        {
          platform: 'telegram',
          platformUserId,
          platformChatId,
          username,
          linkedAt: createdAt
        }
      ]
    };

    await ensureDir(userDir(userId));
    await writeJsonAtomic(userFile(userId, 'user.json'), user);
    await writeJsonAtomic(userFile(userId, 'identities.json'), identities);
    await writeJsonAtomic(userFile(userId, 'preferences.json'), {
      schemaVersion: 1,
      language: 'vi',
      notificationStyle: 'gentle',
      summaryStyle: 'short'
    });

    return userId;
  }

  async findOrCreateActiveWorkspace(userId: string): Promise<string> {
    await this.ensureSystem();
    const index = await readJsonFile<IndexFile>(systemFile('index.json'));
    const existing = index.activeWeddingByUserId[userId];
    if (existing) return existing;

    const workspaceId = makeId('wed');
    const now = nowIso();
    const workspace: WorkspaceRecord = {
      schemaVersion: 1,
      id: workspaceId,
      title: `Wedding Workspace ${workspaceId}`,
      ownerUserIds: [userId],
      status: 'active',
      createdAt: now,
      updatedAt: now
    };

    const planner: PlannerAssignmentRecord = {
      schemaVersion: 1,
      plannerPersonaId: 'mina',
      assignedAt: now,
      assignedBy: 'system',
      mode: 'ai'
    };

    const profile: WeddingProfileRecord = {
      schemaVersion: 1,
      eventDate: null,
      city: null,
      venuePreference: [],
      budgetTarget: null,
      guestTarget: null,
      styleNotes: [],
      confidence: {},
      updatedAt: now
    };

    const tasks: TasksFile = {
      schemaVersion: 1,
      items: []
    };

    await ensureDir(weddingDir(workspaceId));
    await ensureDir(weddingFile(workspaceId, 'generated'));
    await ensureDir(weddingFile(workspaceId, 'conversations'));
    await writeJsonAtomic(weddingFile(workspaceId, 'workspace.json'), workspace);
    await writeJsonAtomic(weddingFile(workspaceId, 'planner.json'), planner);
    await writeJsonAtomic(weddingFile(workspaceId, 'profile.json'), profile);
    await writeJsonAtomic(weddingFile(workspaceId, 'tasks.json'), tasks);
    await writeJsonAtomic(weddingFile(workspaceId, 'reminders.json'), { schemaVersion: 1, items: [] });
    await writeJsonAtomic(weddingFile(workspaceId, 'vendors.json'), { schemaVersion: 1, items: [] });
    await writeJsonAtomic(weddingFile(workspaceId, 'timeline.json'), { schemaVersion: 1, milestones: [], updatedAt: now });
    await writeJsonAtomic(weddingFile(workspaceId, 'decisions.json'), { schemaVersion: 1, items: [] });
    await this.rebuildLatestState(workspaceId);
    await this.rebuildSummary(workspaceId);

    index.activeWeddingByUserId[userId] = workspaceId;
    await writeJsonAtomic(systemFile('index.json'), index);
    return workspaceId;
  }

  async assignPlanner(workspaceId: string, plannerPersonaId: PlannerPersonaId): Promise<void> {
    const planner: PlannerAssignmentRecord = {
      schemaVersion: 1,
      plannerPersonaId,
      assignedAt: nowIso(),
      assignedBy: 'system',
      mode: 'ai'
    };
    await writeJsonAtomic(weddingFile(workspaceId, 'planner.json'), planner);
    await this.rebuildLatestState(workspaceId);
    await this.rebuildSummary(workspaceId);
  }

  async updateProfile(workspaceId: string, patch: Partial<WeddingProfileRecord>): Promise<WeddingProfileRecord> {
    const current = await readJsonFile<WeddingProfileRecord>(weddingFile(workspaceId, 'profile.json'));
    const next: WeddingProfileRecord = {
      ...current,
      ...patch,
      confidence: {
        ...current.confidence,
        ...(patch.confidence ?? {})
      },
      updatedAt: nowIso()
    };
    await writeJsonAtomic(weddingFile(workspaceId, 'profile.json'), next);
    await this.rebuildLatestState(workspaceId);
    await this.rebuildSummary(workspaceId);
    return next;
  }

  async getWorkspaceBundle(workspaceId: string): Promise<{
    workspace: WorkspaceRecord;
    planner: PlannerAssignmentRecord;
    profile: WeddingProfileRecord;
    tasks: TasksFile;
    latestState: LatestStateRecord;
    summary: string;
  }> {
    const [workspace, planner, profile, tasks, latestState, summary] = await Promise.all([
      readJsonFile<WorkspaceRecord>(weddingFile(workspaceId, 'workspace.json')),
      readJsonFile<PlannerAssignmentRecord>(weddingFile(workspaceId, 'planner.json')),
      readJsonFile<WeddingProfileRecord>(weddingFile(workspaceId, 'profile.json')),
      readJsonFile<TasksFile>(weddingFile(workspaceId, 'tasks.json')),
      readJsonFile<LatestStateRecord>(weddingFile(workspaceId, 'latest-state.json')),
      exists(weddingFile(workspaceId, 'summary.md')).then((ok) => ok ? import('./state.io.js').then((m) => m.readTextFile(weddingFile(workspaceId, 'summary.md'))) : '# Empty summary\n')
    ]);

    return { workspace, planner, profile, tasks, latestState, summary };
  }

  async replaceTasks(workspaceId: string, tasks: TasksFile): Promise<void> {
    await writeJsonAtomic(weddingFile(workspaceId, 'tasks.json'), tasks);
    await this.rebuildLatestState(workspaceId);
    await this.rebuildSummary(workspaceId);
  }

  async appendConversationMessage(workspaceId: string, conversationName: string, event: { ts: string; direction: 'inbound' | 'outbound'; platform: 'telegram'; text: string; }): Promise<void> {
    const { appendJsonl } = await import('./state.io.js');
    await appendJsonl(weddingConversationFile(workspaceId, conversationName), event);
  }

  async appendWorkspaceEvent(workspaceId: string, event: Record<string, unknown>): Promise<void> {
    const { appendJsonl } = await import('./state.io.js');
    await appendJsonl(weddingFile(workspaceId, 'events.jsonl'), event);
  }

  async rebuildLatestState(workspaceId: string): Promise<void> {
    const planner = await readJsonFile<PlannerAssignmentRecord>(weddingFile(workspaceId, 'planner.json'));
    const profile = await readJsonFile<WeddingProfileRecord>(weddingFile(workspaceId, 'profile.json'));
    const tasks = await readJsonFile<TasksFile>(weddingFile(workspaceId, 'tasks.json'));
    const openTasks = tasks.items.filter((item) => item.status !== 'done' && item.status !== 'cancelled');
    const latestState: LatestStateRecord = {
      schemaVersion: 1,
      workspaceId,
      plannerPersonaId: planner.plannerPersonaId,
      profile: {
        city: profile.city,
        budgetTarget: profile.budgetTarget,
        guestTarget: profile.guestTarget,
        eventDate: profile.eventDate
      },
      openTasksCount: openTasks.length,
      nextImportantTask: openTasks[0]?.title ?? null,
      updatedAt: nowIso()
    };
    await writeJsonAtomic(weddingFile(workspaceId, 'latest-state.json'), latestState);
  }

  async rebuildSummary(workspaceId: string): Promise<void> {
    const planner = await readJsonFile<PlannerAssignmentRecord>(weddingFile(workspaceId, 'planner.json'));
    const profile = await readJsonFile<WeddingProfileRecord>(weddingFile(workspaceId, 'profile.json'));
    const tasks = await readJsonFile<TasksFile>(weddingFile(workspaceId, 'tasks.json'));
    const openTasks = tasks.items.filter((item) => item.status !== 'done' && item.status !== 'cancelled');

    const content = [
      '# Wedding Summary',
      '',
      '## Snapshot',
      `- Planner: ${planner.plannerPersonaId}`,
      `- Date: ${profile.eventDate ?? 'chưa rõ'}`,
      `- City: ${profile.city ?? 'chưa rõ'}`,
      `- Budget target: ${profile.budgetTarget ?? 'chưa rõ'}`,
      `- Guest target: ${profile.guestTarget ?? 'chưa rõ'}`,
      '',
      '## Current priorities',
      ...(openTasks.length > 0 ? openTasks.slice(0, 5).map((task) => `- ${task.title}`) : ['- Chưa có task nào'])
    ].join('\n') + '\n';

    await writeTextAtomic(weddingFile(workspaceId, 'summary.md'), content);
  }
}
