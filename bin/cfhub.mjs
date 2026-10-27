#!/usr/bin/env node
import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { run } from "../src/cli.mjs";
import { runCliLifecycle } from "../src/cli-lifecycle.mjs";

export { run } from "../src/cli.mjs";

const invokedPath = process.argv[1] ? realpathSync(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  runCliLifecycle(run);
}
