import * as fs from "node:fs";
import { configRoot } from "./config.mjs";
import { replaceJsonFile } from "./atomic-json-file.mjs";
import { ensurePrivateDirectory } from "./filesystem-paths.mjs";

function aliasesPath(homeDir) {
  return `${configRoot(homeDir)}/aliases.json`;
}
export function readAliases(homeDir, fsImpl = fs) {
  const path = aliasesPath(homeDir);
  if (typeof fsImpl.existsSync !== "function" || !fsImpl.existsSync(path)) return {};
  try {
    return JSON.parse(fsImpl.readFileSync(path, "utf8"));
  } catch (error) {
    if (error instanceof SyntaxError) return {};
    throw error;
  }
}
export function writeAliases(aliases, homeDir, fsImpl = fs) {
  const path = aliasesPath(homeDir);
  ensurePrivateDirectory(configRoot(homeDir), fsImpl);
  replaceJsonFile(path, aliases, fsImpl);
}
