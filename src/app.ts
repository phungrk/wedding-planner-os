import Fastify from 'fastify';
import { registerHealthRoutes } from './modules/health/health.routes.js';
import { registerTelegramRoutes } from './modules/telegram/telegram.routes.js';

export function buildApp() {
  const app = Fastify({ logger: true });
  registerHealthRoutes(app);
  registerTelegramRoutes(app);
  return app;
}
