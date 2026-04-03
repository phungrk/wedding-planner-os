import fs from 'node:fs/promises';
import path from 'node:path';
import { parseJson, stringifyJson } from '../../shared/json.js';

export async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

export async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, 'utf8');
  return parseJson<T>(raw);
}

export async function writeJsonAtomic(filePath: string, value: unknown): Promise<void> {
  await ensureDir(path.dirname(filePath));
  const tempPath = `${filePath}.tmp`;
  await fs.writeFile(tempPath, stringifyJson(value), 'utf8');
  await fs.rename(tempPath, filePath);
}

export async function readTextFile(filePath: string): Promise<string> {
  return fs.readFile(filePath, 'utf8');
}

export async function writeTextAtomic(filePath: string, content: string): Promise<void> {
  await ensureDir(path.dirname(filePath));
  const tempPath = `${filePath}.tmp`;
  await fs.writeFile(tempPath, content, 'utf8');
  await fs.rename(tempPath, filePath);
}

export async function appendJsonl(filePath: string, value: unknown): Promise<void> {
  await ensureDir(path.dirname(filePath));
  await fs.appendFile(filePath, JSON.stringify(value) + '\n', 'utf8');
}

export async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
