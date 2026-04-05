import { WorkspaceStateGateway } from '../../../modules/state/workspace-state.gateway.js';

export class GetSummaryQuery {
  constructor(private readonly state = new WorkspaceStateGateway()) {}

  async execute(workspaceId: string): Promise<{ summary: string }> {
    const bundle = await this.state.getWorkspaceBundle(workspaceId);
    return { summary: bundle.summary };
  }
}
