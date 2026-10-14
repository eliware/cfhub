import { run } from "./cli-live-runner.mjs";

export let zoneId = process.env.CFHUB_LIVE_ZONE_ID;
export let accountId = process.env.CFHUB_LIVE_ACCOUNT_ID;

export function withContext(args, { zone = zoneId, account = accountId } = {}) {
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
  if (needsZone && zone) context.push("--zone-id", zone);
  if (resource === "origin-ca" && zone) context.push("--zone-id", zone);
  if (needsAccount && account) context.push("--account-id", account);
  if (resource === "rulesets") {
    if (zone) context.push("--zone-id", zone);
    if (account) context.push("--account-id", account);
  }
  return [...args, ...context];
}

export async function discoverContext(runCommand = run, context = { zoneId, accountId }) {
  if (context.zoneId && context.accountId) return;
  const result = await runCommand(["zones", "list", "--json"]);
  if (result.code !== 0) return;
  try {
    const payload = JSON.parse(result.stdout);
    const zones = payload.result || payload;
    const firstZone = Array.isArray(zones) ? zones[0] : null;
    context.zoneId ||= firstZone?.id;
    context.accountId ||= firstZone?.account?.id;
    zoneId = context.zoneId;
    accountId = context.accountId;
  } catch {
    // Each test reports missing context when discovery fails.
  }
}
