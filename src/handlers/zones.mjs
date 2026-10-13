import { getAccountId, getZoneId } from "./identifiers.mjs";
import { requireValue } from "./argument-validation.mjs";
import { printTable } from "../output-table.mjs";
import { handleZoneReport } from "./zone-reports.mjs";

export async function handleZones({
  cf,
  action,
  opts,
  body,
  outputJson,
  printer = console,
  toJsonOutput,
  fail,
}) {
  const accountId = getAccountId(opts);
  const zoneId = getZoneId(opts);

  if (action === "list") {
    const res =
      typeof cf.get === "function"
        ? await cf.get(accountId ? `/zones?account.id=${accountId}` : "/zones", undefined)
        : await cf.zones.list(accountId ? { account: { id: accountId } } : undefined);
    const items = Array.isArray(res?.result) ? res.result : res;
    return outputJson
      ? toJsonOutput(items)
      : printTable(
          ["ID", "NAME"],
          items.map((z) => [z.id, z.name]),
          printer.log,
        );
  }

  if (action === "get") {
    requireValue(zoneId, "Missing --zone-id", fail);

    const zone =
      typeof cf.get === "function"
        ? await cf.get(`/zones/${zoneId}`, undefined)
        : await cf.zones.get({ zone_id: zoneId });
    return outputJson ? toJsonOutput(zone) : printer.log(JSON.stringify(zone, null, 2));
  }

  if (action === "audit" || action === "security")
    return handleZoneReport({ cf, action, opts, outputJson, toJsonOutput, printer, fail });

  if (action === "create") {
    requireValue(body, "Missing --data or --file", fail);
    if (opts["dry-run"])
      return printer.log(JSON.stringify({ action: "create", body, dryRun: true }, null, 2));

    const res =
      typeof cf.post === "function"
        ? await cf.post("/zones", { body })
        : await cf.zones.create(body);
    return outputJson ? toJsonOutput(res) : printer.log(JSON.stringify(res, null, 2));
  }

  if (action === "update") {
    requireValue(zoneId, "Missing --zone-id", fail);
    requireValue(body, "Missing --data or --file", fail);
    if (opts["dry-run"])
      return printer.log(JSON.stringify({ zoneId, action: "update", body, dryRun: true }, null, 2));

    const res =
      typeof cf.patch === "function"
        ? await cf.patch(`/zones/${zoneId}`, { body })
        : await cf.zones.edit({ zone_id: zoneId, ...body });
    return outputJson ? toJsonOutput(res) : printer.log(JSON.stringify(res, null, 2));
  }

  if (action === "delete") {
    requireValue(zoneId, "Missing --zone-id", fail);
    requireValue(opts.force, "Refusing to delete without --force", fail);

    const res =
      typeof cf.delete === "function"
        ? await cf.delete(`/zones/${zoneId}`)
        : await cf.zones.delete({ zone_id: zoneId });
    return outputJson ? toJsonOutput(res) : printer.log(JSON.stringify(res, null, 2));
  }

  fail(`Unknown zones action: ${action}`);
}
