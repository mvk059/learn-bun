/**
 * Chapter 1.4 - File Operations (Solution)
 */

export async function readJsonFile<T>(path: string): Promise<T> {
  const file = Bun.file(path);
  if (!(await file.exists())) {
    throw new Error(`File not found: ${path}`);
  }
  return file.json() as Promise<T>;
}

export async function writeJsonFile(path: string, data: unknown): Promise<void> {
  await Bun.write(path, JSON.stringify(data, null, 2));
}

export async function fileExists(path: string): Promise<boolean> {
  return Bun.file(path).exists();
}

export async function appendToLog(path: string, message: string): Promise<void> {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}\n`;

  const file = Bun.file(path);
  let existing = "";
  if (await file.exists()) {
    existing = await file.text();
  }

  await Bun.write(path, existing + line);
}
