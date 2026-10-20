import { configRoot } from "../config.mjs";

export function writeUpdateCache(path, homeDir, fsImpl, cache) {
  fsImpl.mkdirSync(configRoot(homeDir), { recursive: true });
  fsImpl.writeFileSync(path, `${JSON.stringify(cache)}\n`, { mode: 0o600 });
  if (typeof fsImpl.chmodSync === "function") fsImpl.chmodSync(path, 0o600);
}
