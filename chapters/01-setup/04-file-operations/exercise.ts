/**
 * Chapter 1.4 - File Operations
 *
 * Learn to read and write files using Bun's built-in APIs.
 */

// TODO: Implement readJsonFile<T>
// Read a JSON file and return parsed data
// If the file doesn't exist, throw an Error with message "File not found: {path}"
// Use Bun.file(path) and its .exists() and .json() methods
export async function readJsonFile<T>(path: string): Promise<T> {
  throw new Error("Not implemented");
}

// TODO: Implement writeJsonFile
// Write data to a JSON file with 2-space indentation
// Use Bun.write() with JSON.stringify()
export async function writeJsonFile(path: string, data: unknown): Promise<void> {
  throw new Error("Not implemented");
}

// TODO: Implement fileExists
// Return true if the file exists, false otherwise
// Use Bun.file(path).exists()
export async function fileExists(path: string): Promise<boolean> {
  throw new Error("Not implemented");
}

// TODO: Implement appendToLog
// Append a timestamped line to a log file
// Format: "[ISO_TIMESTAMP] message\n"
// Example: "[2024-01-15T10:30:00.000Z] Server started\n"
// If the file doesn't exist, create it
// If it does exist, append to the existing content
export async function appendToLog(path: string, message: string): Promise<void> {
  throw new Error("Not implemented");
}
