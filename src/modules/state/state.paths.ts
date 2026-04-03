import path from 'node:path';
import { env } from '../../config/env.js';

export function dataRoot(): string {
  return env.dataDir;
}

export function usersDir(): string {
  return path.join(dataRoot(), 'users');
}

export function weddingsDir(): string {
  return path.join(dataRoot(), 'weddings');
}

export function personasDir(): string {
  return path.join(dataRoot(), 'personas');
}

export function templatesDir(): string {
  return path.join(dataRoot(), 'templates');
}

export function systemDir(): string {
  return path.join(dataRoot(), 'system');
}

export function userDir(userId: string): string {
  return path.join(usersDir(), userId);
}

export function weddingDir(workspaceId: string): string {
  return path.join(weddingsDir(), workspaceId);
}

export function weddingFile(workspaceId: string, file: string): string {
  return path.join(weddingDir(workspaceId), file);
}

export function weddingConversationFile(workspaceId: string, name: string): string {
  return path.join(weddingDir(workspaceId), 'conversations', `${name}.jsonl`);
}

export function userFile(userId: string, file: string): string {
  return path.join(userDir(userId), file);
}

export function systemFile(file: string): string {
  return path.join(systemDir(), file);
}
