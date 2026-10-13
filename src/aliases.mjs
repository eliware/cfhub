import * as fs from "node:fs";
import { configRoot } from "./config.mjs";
import { ensurePrivateDirectory, replaceJsonFile } from "./atomic-json-file.mjs";

function aliasesPath(homeDir) {
  return `${configRoot(homeDir)}/aliases.json`;
}
export function readAliases(homeDir, fsImpl = fs) {
  const path = aliasesPath(homeDir);
  if (typeof fsImpl.existsSync !== "function" || !fsImpl.existsSync(path)) return {};
  return JSON.parse(fsImpl.readFileSync(path, "utf8"));
}
export function writeAliases(aliases, homeDir, fsImpl = fs) {
  const path = aliasesPath(homeDir);
  ensurePrivateDirectory(configRoot(homeDir), fsImpl);
  replaceJsonFile(path, aliases, fsImpl);
}
