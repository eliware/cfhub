import path from "node:path";
import { fileURLToPath } from "node:url";

export { loadEnvFile } from "./env.mjs";

export function projectRootFromMeta(importMetaUrl) {
  return path.resolve(path.dirname(fileURLToPath(importMetaUrl)), "..");
}
