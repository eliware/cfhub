import { getZoneId, getId, requireValue } from "./common.mjs";
import { printTable } from "../output.mjs";
import { handleDnsDiff } from "./dns-diff.mjs";
import { handleDnsMutation } from "./dns-mutations.mjs";

export async function handleDnsRecords({
  cf,
  action,
  opts,
  body,
  outputJson,
  printer = console,
  toJsonOutput,
  fail,
}) {
  const zoneId = getZoneId(opts);
  const id = getId(opts);
  requireValue(zoneId, "Missing --zone-id", fail);

  const listRecords = () =>
    typeof cf.get === "function"
      ? cf.get(`/zones/${zoneId}/dns_records`, undefined)
      : cf.dns.records.list({ zone_id: zoneId });

  if (action === "list") {
    const res = await listRecords();
    const items = Array.isArray(res?.result) ? res.result : res;
    return outputJson
      ? toJsonOutput(items)
      : printTable(
          ["ID", "TYPE", "NAME", "CONTENT"],
          items.map((r) => [r.id, r.type, r.name, r.content]),
          printer.log,
        );
  }

  if (action === "diff" || action === "apply")
    return handleDnsDiff({
      action,
      zoneId,
      opts,
      body,
      outputJson,
      printer,
      toJsonOutput,
      fail,
      cf,
      listRecords,
    });

  if (action === "get") {
    requireValue(id, "Missing --id", fail);

    const res =
      typeof cf.get === "function"
        ? await cf.get(`/zones/${zoneId}/dns_records/${id}`, undefined)
        : await cf.dns.records.get(id, { zone_id: zoneId });
    return outputJson ? toJsonOutput(res) : printer.log(JSON.stringify(res, null, 2));
  }

  if (["create", "update", "delete"].includes(action))
    return handleDnsMutation({
      action,
      zoneId,
      id,
      body,
      opts,
      cf,
      outputJson,
      toJsonOutput,
      printer,
      fail,
    });

  fail(`Unknown dns-records action: ${action}`);
}
