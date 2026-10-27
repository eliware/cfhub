import * as fs from "node:fs";
import { parseEnvFile } from "../env-file-parser.mjs";

export function loadEnvFile(filePath, env = process.env, fsImpl = fs) {
  if (!fsImpl.existsSync(filePath)) return false;
  parseEnvFile(fsImpl.readFileSync(filePath, "utf8"), env);
  return true;
}
