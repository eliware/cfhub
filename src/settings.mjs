import * as fs from "node:fs";
import { configRoot } from "./config.mjs";
import { ensurePrivateDirectory, replaceJsonFile } from "./atomic-json-file.mjs";

function settingsPath(homeDir) {
  return `${configRoot(homeDir)}/config.json`;
}
export function readSettings(homeDir, fsImpl = fs) {
  const path = settingsPath(homeDir);
  if (typeof fsImpl.existsSync !== "function" || !fsImpl.existsSync(path)) return {};
  return JSON.parse(fsImpl.readFileSync(path, "utf8"));
}
export function writeSettings(settings, homeDir, fsImpl = fs) {
  const path = settingsPath(homeDir);
  ensurePrivateDirectory(configRoot(homeDir), fsImpl);
  replaceJsonFile(path, settings, fsImpl);
}
