import * as fs from "node:fs";
import { configRoot } from "./config.mjs";
import { replaceJsonFile } from "./atomic-json-file.mjs";
import { ensurePrivateDirectory } from "./filesystem-paths.mjs";

function settingsPath(homeDir) {
  return `${configRoot(homeDir)}/config.json`;
}
export function readSettings(homeDir, fsImpl = fs) {
  const path = settingsPath(homeDir);
  if (typeof fsImpl.existsSync !== "function" || !fsImpl.existsSync(path)) return {};
  try {
    return JSON.parse(fsImpl.readFileSync(path, "utf8"));
  } catch (error) {
    if (error instanceof SyntaxError) return {};
    throw error;
  }
}
export function writeSettings(settings, homeDir, fsImpl = fs) {
  const path = settingsPath(homeDir);
  ensurePrivateDirectory(configRoot(homeDir), fsImpl);
  replaceJsonFile(path, settings, fsImpl);
}
