import { getZoneId, getId } from "./identifiers.mjs";
import { requireValue } from "./argument-validation.mjs";
import { displayDnsRecords } from "./dns-read.mjs";
import { getDnsRecord } from "./dns-record-get.mjs";
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
    return displayDnsRecords(res, { outputJson, toJsonOutput, printer });
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

  if (action === "get")
    return getDnsRecord({ cf, zoneId, id, outputJson, toJsonOutput, printer, fail });

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
