import { ChecklistService } from '../../../modules/checklist/checklist.service.js';
import { WorkspaceStateGateway } from '../../../modules/state/workspace-state.gateway.js';
import { nowIso } from '../../../shared/time.js';
import type { WeddingProfileRecord } from '../../../modules/state/state.types.js';

export class UpdateWeddingProfileCommand {
  constructor(
    private readonly state = new WorkspaceStateGateway(),
    private readonly checklist = new ChecklistService()
  ) {}

  async execute(workspaceId: string, patch: Partial<WeddingProfileRecord>): Promise<{ profile: WeddingProfileRecord; plannerPersonaId: 'mina' | 'luna' }> {
    const bundle = await this.state.getWorkspaceBundle(workspaceId);
    const nextProfile = await this.state.updateProfile(workspaceId, patch);

    await this.state.appendWorkspaceEvent(workspaceId, {
      ts: nowIso(),
      type: 'profile_updated',
      fields: Object.keys(patch)
    });

    if (bundle.tasks.items.length === 0) {
      const tasks = this.checklist.buildStarterChecklist(bundle.planner.plannerPersonaId);
      await this.state.replaceTasks(workspaceId, tasks);
      await this.state.appendWorkspaceEvent(workspaceId, {
        ts: nowIso(),
        type: 'starter_checklist_generated',
        plannerPersonaId: bundle.planner.plannerPersonaId
      });
    }

    return { profile: nextProfile, plannerPersonaId: bundle.planner.plannerPersonaId };
  }
}
