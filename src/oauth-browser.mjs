import { spawn } from "node:child_process";

export function openBrowser(url, options, spawnImpl = spawn) {
  const { platform = process.platform, spawnImpl: configuredSpawnImpl = spawnImpl } = options ?? {};
  const command = platform === "darwin" ? "open" : platform === "win32" ? "start" : "xdg-open";
  const child = configuredSpawnImpl(command, [url], {
    detached: true,
    stdio: "ignore",
    shell: platform === "win32",
  });
  child.unref();
  return child;
}
