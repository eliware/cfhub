import os from "node:os";
import * as fs from "node:fs";
import { inspectExtension } from "./extension/inspect.mjs";
import { mutateExtension } from "./extension/mutate.mjs";

export function handleExtension({
  action,
  opts,
  outputJson,
  printer,
  toJsonOutput,
  fail,
  fsImpl = fs,
  homeDir = os.homedir(),
}) {
  const context = { action, opts, outputJson, printer, toJsonOutput, fail, fsImpl, homeDir };
  if (action === "list" || action === "info") return inspectExtension(context);
  if (action === "install" || action === "upgrade" || action === "remove")
    return mutateExtension(context);
  return fail(`Unknown extension action: ${action}`);
}
