import type { FastifyInstance } from 'fastify';
import { env } from '../../config/env.js';

export async function registerHealthRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', async () => ({ ok: true, dataDir: env.dataDir }));
}
