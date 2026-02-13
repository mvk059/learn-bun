/**
 * Chapter 1.4 - File Operations
 *
 * Learn to read and write files using Bun's built-in APIs.
 */


// Read a JSON file and return parsed data
// If the file doesn't exist, throw an Error with message "File not found: {path}"
// Use Bun.file(path) and its .exists() and .json() methods
export async function readJsonFile<T>(path: string): Promise<T> {
  const file = Bun.file(path);
  if (!await file.exists()) {
    throw new Error(`File not found: ${path}`);
  }
  return file.json();
}

// Write data to a JSON file with 2-space indentation
// Use Bun.write() with JSON.stringify()
export async function writeJsonFile(path: string, data: unknown): Promise<void> {
  await Bun.write(path, JSON.stringify(data, null, 2));
}

// Return true if the file exists, false otherwise
// Use Bun.file(path).exists()
export async function fileExists(path: string): Promise<boolean> {
  const file = Bun.file(path);
  return await file.exists();
}

// Append a timestamped line to a log file
// Format: "[ISO_TIMESTAMP] message\n"
// Example: "[2024-01-15T10:30:00.000Z] Server started\n"
// If the file doesn't exist, create it
// If it does exist, append to the existing content
export async function appendToLog(path: string, message: string): Promise<void> {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ${message}\n`;

  const file = Bun.file(path);
  let existing = "";
  if (await file.exists()) {
    existing = await file.text();
  }

  await Bun.write(path, existing + logLine);
}
