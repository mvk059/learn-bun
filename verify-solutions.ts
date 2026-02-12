#!/usr/bin/env bun
/**
 * Verify all solution files pass their tests.
 *
 * Usage:
 *   bun run verify                  # Run ALL solution tests
 *   bun run verify:chapter 01       # Run chapter 01 solutions only
 */

import { Glob } from "bun";
import { resolve } from "path";

const args = process.argv.slice(2);
let chapterFilter: string | null = null;

if (args.includes("--chapter") && args.length > args.indexOf("--chapter") + 1) {
  chapterFilter = args[args.indexOf("--chapter") + 1];
} else if (args.length === 1 && /^\d{2}$/.test(args[0])) {
  chapterFilter = args[0];
}

const rootDir = import.meta.dir;
const chaptersDir = resolve(rootDir, "chapters");

const pattern = chapterFilter
  ? `${chapterFilter}-*/*/exercise.test.ts`
  : "*/*/exercise.test.ts";

const glob = new Glob(pattern);
const testFiles: string[] = [];

for await (const file of glob.scan({ cwd: chaptersDir })) {
  testFiles.push(resolve(chaptersDir, file));
}

testFiles.sort();

if (testFiles.length === 0) {
  console.error(`No test files found${chapterFilter ? ` for chapter ${chapterFilter}` : ""}.`);
  process.exit(1);
}

console.log(`\n📋 Running ${testFiles.length} solution tests...\n`);

let passed = 0;
let failed = 0;
const failures: string[] = [];

for (const testFile of testFiles) {
  const relative = testFile.replace(rootDir + "/", "");
  const proc = Bun.spawn(["bun", "test", testFile], {
    cwd: rootDir,
    env: { ...process.env, TEST_SOLUTION: "1" },
    stdout: "pipe",
    stderr: "pipe",
  });

  const exitCode = await proc.exited;
  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();

  if (exitCode === 0) {
    console.log(`  ✅ ${relative}`);
    passed++;
  } else {
    console.log(`  ❌ ${relative}`);
    failures.push(relative);
    if (stderr) console.log(`     ${stderr.split("\n").slice(0, 5).join("\n     ")}`);
    failed++;
  }
}

console.log(`\n${"─".repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed, ${testFiles.length} total`);

if (failures.length > 0) {
  console.log(`\nFailed tests:`);
  failures.forEach((f) => console.log(`  - ${f}`));
  process.exit(1);
} else {
  console.log(`\n🎉 All solution tests passed!`);
}
