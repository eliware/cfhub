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

export const basicCommands = [
  ["auth", "status", "--json"],
  ["zones", "list", "--json"],
  ["dns-records", "list", "--json"],
  ["rulesets", "list", "--json"],
  ["lists", "list", "--json"],
  ["audit", "list", "--json"],
  ["origin-ca", "list", "--json"],
  ["workers", "list", "--json"],
  ["pages", "list", "--json"],
  ["r2", "list", "--json"],
  ["d1", "list", "--json"],
  ["queues", "list", "--json"],
  ["stream", "list", "--json"],
  ["images", "list", "--json"],
  ["ai", "list", "--json"],
  ["access", "list", "--json"],
];

if (includeInventory) basicCommands.push(["inventory", "export", "--json"]);

export const crudCommands = [
  ["zones", ["list", "get", "create", "update", "delete"]],
  ["dns-records", ["list", "get", "create", "update", "delete"]],
  ["rulesets", ["list", "get", "create", "update"]],
  ["list-items", ["list", "create", "delete"]],
  ["health", ["list", "get", "create", "delete"]],
  ["origin-ca", ["list", "create", "revoke"]],
  ["load-balancer", ["list", "get", "create", "update", "delete"]],
  ["tunnel", ["list", "get", "create", "update", "delete"]],
  ...["workers", "pages", "r2", "d1", "queues", "stream", "images", "ai", "access"].map(
    (resource) => [resource, ["list", "get", "create", "update", "delete"]],
  ),
];

export const helpCommands = [
  [],
  ["--help"],
  ["auth", "--help"],
  ["zones", "--help"],
  ["dns-records", "--help"],
  ["zone-settings", "--help"],
  ["rulesets", "--help"],
  ["lists", "--help"],
  ["list-items", "--help"],
  ["ssl", "--help"],
  ["cache", "--help"],
  ["health", "--help"],
  ["audit", "--help"],
  ["inventory", "--help"],
  ["origin-ca", "--help"],
  ["load-balancer", "--help"],
  ["tunnel", "--help"],
  ["workers", "--help"],
  ["pages", "--help"],
  ["r2", "--help"],
  ["d1", "--help"],
  ["queues", "--help"],
  ["stream", "--help"],
  ["images", "--help"],
  ["ai", "--help"],
  ["access", "--help"],
];

export const dryRunCommands = [
  ["zones", "create", "--data", JSON.stringify({ name: "dry-run.example.invalid" })],
  ["zones", "update", "--data", JSON.stringify({ name: "dry-run.example.invalid" })],
  [
    "dns-records",
    "create",
    "--data",
    JSON.stringify({ type: "A", name: "dry-run", content: "192.0.2.1" }),
  ],
  [
    "dns-records",
    "update",
    "--id",
    "dry-run-record",
    "--data",
    JSON.stringify({ content: "192.0.2.2" }),
  ],
  [
    "zone-settings",
    "set",
    "--setting",
    "development_mode",
    "--data",
    JSON.stringify({ value: "off" }),
  ],
  ["rulesets", "create", "--data", JSON.stringify({ name: "cfhub-dry-run" })],
  [
    "rulesets",
    "update",
    "--id",
    "dry-run-ruleset",
    "--data",
    JSON.stringify({ name: "cfhub-dry-run" }),
  ],
  ["lists", "create", "--data", JSON.stringify({ name: "cfhub-dry-run", kind: "ip" })],
  [
    "lists",
    "update",
    "--id",
    "dry-run-list",
    "--data",
    JSON.stringify({ description: "cfhub-dry-run" }),
  ],
  ["list-items", "create", "--id", "dry-run-list", "--data", JSON.stringify({ ip: "192.0.2.1" })],
  ["health", "create", "--data", JSON.stringify({ name: "cfhub-dry-run" })],
  ["origin-ca", "create", "--data", JSON.stringify({ hostnames: ["dry-run.example.invalid"] })],
  ["ssl", "set", "--setting", "ssl", "--value", "full"],
  ["cache", "purge", "--data", JSON.stringify({ hosts: ["dry-run.example.invalid"] })],
];

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
