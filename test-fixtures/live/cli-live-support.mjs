import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { activeProfile } from "../../src/profiles.mjs";
import { requiredScopes } from "../../src/scopes.mjs";

const execFileAsync = promisify(execFile);
const cli = process.env.CFHUB_BIN || fileURLToPath(new URL("../../bin/cfhub.mjs", import.meta.url));
export const liveEnabled = process.env.CFHUB_LIVE_TESTS === "1";
export const wetEnabled = process.env.CFHUB_LIVE_MUTATIONS === "1";
export const includeInventory = process.env.CFHUB_LIVE_INCLUDE_INVENTORY === "1";
export let zoneId = process.env.CFHUB_LIVE_ZONE_ID;
export let accountId = process.env.CFHUB_LIVE_ACCOUNT_ID;
const profile = (() => {
  try {
    return activeProfile();
  } catch {
    return null;
  }
})();
export const liveReady = Boolean(profile || process.env.CLOUDFLARE_API_TOKEN);
const grantedScopes = profile?.scopes?.length ? profile.scopes : null;

export async function run(args, options = {}) {
  try {
    const result = await execFileAsync(cli, args, {
      env: { ...process.env },
      maxBuffer: 2 * 1024 * 1024,
      ...options,
    });
    return { ...result, code: 0 };
  } catch (error) {
    return {
      stdout: error.stdout || "",
      stderr: error.stderr || "",
      code: error.code ?? 1,
    };
  }
}

export function parseJson(result) {
  return JSON.parse(result.stdout);
}

function unavailableCapability(result) {
  return /not enabled|enable .*dashboard|not authorized|authorization failure|no route for that uri|maximum number of lists|invalid_name|provide a zone id|stored certificate|code 1012|health checks disabled/i.test(
    `${result.stdout}\n${result.stderr}`,
  );
}

export function skipUnavailable(label, result) {
  if (!unavailableCapability(result)) return false;
  console.warn(`Skipping ${label}: Cloudflare capability is unavailable.`);
  return true;
}

export function canRun(resource, action = "list") {
  if (!liveReady) return false;
  if (!grantedScopes) return true;
  return requiredScopes(resource, action).every((scope) => grantedScopes.includes(scope));
}

export { basicCommands, crudCommands, dryRunCommands, helpCommands } from "./cli-live-commands.mjs";

export function withContext(args) {
  const resource = args[0];
  const needsZone = ["dns-records", "zone-settings", "ssl", "health", "load-balancer"].includes(
    resource,
  );
  const needsAccount = [
    "lists",
    "list-items",
    "audit",
    "inventory",
    "workers",
    "pages",
    "r2",
    "d1",
    "queues",
    "stream",
    "images",
    "ai",
    "access",
    "tunnel",
  ].includes(resource);
  const context = [];
  if (needsZone && zoneId) context.push("--zone-id", zoneId);
  if (resource === "origin-ca" && zoneId) context.push("--zone-id", zoneId);
  if (needsAccount && accountId) context.push("--account-id", accountId);
  if (resource === "rulesets") {
    if (zoneId) context.push("--zone-id", zoneId);
    if (accountId) context.push("--account-id", accountId);
  }
  return [...args, ...context];
}

export async function discoverContext() {
  if (zoneId && accountId) return;
  const result = await run(["zones", "list", "--json"]);
  if (result.code !== 0) return;
  try {
    const zones = JSON.parse(result.stdout).result || JSON.parse(result.stdout);
    const firstZone = Array.isArray(zones) ? zones[0] : null;
    zoneId ||= firstZone?.id;
    accountId ||= firstZone?.account?.id;
  } catch {
    // Each test reports missing context when discovery fails.
  }
}
