export function parseJson<T>(raw: string): T {
  return JSON.parse(raw) as T;
}

export function stringifyJson(value: unknown): string {
  return JSON.stringify(value, null, 2) + '\n';
}
