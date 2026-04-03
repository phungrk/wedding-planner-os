export type PlannerPersonaId = 'mina' | 'luna';

export interface UserRecord {
  schemaVersion: number;
  id: string;
  displayName: string;
  role: 'couple' | 'planner' | 'admin';
  timezone: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

export interface IdentityRecord {
  platform: 'telegram';
  platformUserId: string;
  platformChatId: string;
  username?: string;
  linkedAt: string;
}

export interface IdentitiesFile {
  schemaVersion: number;
  items: IdentityRecord[];
}

export interface WorkspaceRecord {
  schemaVersion: number;
  id: string;
  title: string;
  ownerUserIds: string[];
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface PlannerAssignmentRecord {
  schemaVersion: number;
  plannerPersonaId: PlannerPersonaId;
  assignedAt: string;
  assignedBy: string;
  mode: 'ai';
}

export interface WeddingProfileRecord {
  schemaVersion: number;
  eventDate: string | null;
  city: string | null;
  venuePreference: string[];
  budgetTarget: number | null;
  guestTarget: number | null;
  styleNotes: string[];
  confidence: Record<string, 'draft' | 'confirmed' | 'estimated'>;
  updatedAt: string;
}

export interface ChecklistTask {
  id: string;
  title: string;
  category: string;
  status: 'open' | 'in_progress' | 'done' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  dueAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TasksFile {
  schemaVersion: number;
  items: ChecklistTask[];
}

export interface LatestStateRecord {
  schemaVersion: number;
  workspaceId: string;
  plannerPersonaId: PlannerPersonaId;
  profile: {
    city: string | null;
    budgetTarget: number | null;
    guestTarget: number | null;
    eventDate: string | null;
  };
  openTasksCount: number;
  nextImportantTask: string | null;
  updatedAt: string;
}

export interface IndexFile {
  schemaVersion: number;
  activeWeddingByUserId: Record<string, string>;
}

export interface ConversationMessageEvent {
  ts: string;
  direction: 'inbound' | 'outbound';
  platform: 'telegram';
  text: string;
}

export interface WorkspaceEvent {
  ts: string;
  type: string;
  [key: string]: unknown;
}
