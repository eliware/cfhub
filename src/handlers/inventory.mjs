import { getAccountId } from "./identifiers.mjs";
import { requireValue } from "./argument-validation.mjs";
import { collectZoneInventory } from "./inventory-zone.mjs";

export async function handleInventory({
  cf,
  action,
  opts,
  outputJson,
  printer,
  toJsonOutput,
  fail,
}) {
  const accountId = getAccountId(opts);
  requireValue(accountId, "Missing --account-id", fail);
  if (action !== "export") {
    fail(`Unknown inventory action: ${action}`);
    return;
  }

  const zonesResponse =
    typeof cf.get === "function"
      ? await cf.get(`/zones?account.id=${accountId}`, undefined)
      : await cf.zones.list({ account: { id: accountId } });
  const zones = Array.isArray(zonesResponse?.result) ? zonesResponse.result : [];
  const inventory = await Promise.all(zones.map((zone) => collectZoneInventory(cf, zone)));
  const result = { accountId, zones: inventory };
  return outputJson ? toJsonOutput(result) : printer.log(JSON.stringify(result, null, 2));
}
