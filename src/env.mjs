import * as fs from "node:fs";
import { fileURLToPath } from "node:url";
import os from "node:os";
import { parseEnvFile } from "./env-file-parser.mjs";

export function loadEnvFile(filePath, env = process.env, fsImpl = fs) {
  if (!fsImpl.existsSync(filePath)) return false;
  parseEnvFile(fsImpl.readFileSync(filePath, "utf8"), env);
  return true;
}

export function loadUserEnv(homeDir = os.homedir(), env = process.env, fsImpl = fs) {
  return loadEnvFile(`${homeDir}/.cfhub`, env, fsImpl);
}

export function loadProjectEnv(
  projectRoot,
  env = process.env,
  fsImpl = fs,
  homeDir = os.homedir(),
) {
  loadUserEnv(homeDir, env, fsImpl);
  const rootUrl = new URL(`file://${projectRoot.replaceAll("\\", "/")}/`);
  return loadEnvFile(fileURLToPath(new URL(".env", rootUrl)), env, fsImpl);
}

export function requireEnv(name, env = process.env) {
  const value = env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}
