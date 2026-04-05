import { nowIso } from '../../../shared/time.js';
import { PersonasService } from '../../../modules/personas/personas.service.js';
import { WorkspaceStateGateway } from '../../../modules/state/workspace-state.gateway.js';
import type { PlannerPersonaId } from '../../../modules/state/state.types.js';

export class AssignPlannerPersonaCommand {
  constructor(
    private readonly state = new WorkspaceStateGateway(),
    private readonly personas = new PersonasService()
  ) {}

  async execute(workspaceId: string, plannerPersonaId: PlannerPersonaId): Promise<{ reply: string }> {
    await this.state.assignPlanner(workspaceId, plannerPersonaId);
    await this.state.appendWorkspaceEvent(workspaceId, {
      ts: nowIso(),
      type: 'planner_assigned',
      plannerPersonaId
    });

    const persona = this.personas.get(plannerPersonaId);
    return {
      reply: `Đã chuyển sang planner ${persona.displayName}. ${persona.intro}`
    };
  }
}
