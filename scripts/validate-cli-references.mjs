#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { renderShellCompletions } from "../src/cli/reference/completions.mjs";
import { renderCommandReference } from "../src/cli/reference/markdown.mjs";

const checkOnly = process.argv.includes("--check");
const outputs = {
  "docs/commands.md": renderCommandReference(),
  ...renderShellCompletions(),
};
const stale = [];

for (const [path, content] of Object.entries(outputs)) {
  const target = fileURLToPath(new URL(`../${path}`, import.meta.url));
  if (checkOnly) {
    if (readFileSync(target, "utf8") !== content) stale.push(path);
  } else {
    writeFileSync(target, content);
  }
}

if (stale.length) {
  console.error(`Generated command references are out of date: ${stale.join(", ")}`);
  process.exitCode = 1;
}
