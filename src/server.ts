import { buildApp } from './app.js';
import { env } from './config/env.js';
import { WorkspaceStateGateway } from './modules/state/workspace-state.gateway.js';

const state = new WorkspaceStateGateway();
await state.ensureSystem();

const app = buildApp();
await app.listen({ port: env.port, host: '0.0.0.0' });
