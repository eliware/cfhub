import { getZoneId, getId } from "../identifiers.mjs";
import { requireValue } from "../argument-validation.mjs";
import { displayDnsRecords } from "./read.mjs";
import { getDnsRecord } from "./record-get.mjs";
import { handleDnsDiff } from "./diff.mjs";
import { writeDnsRecord } from "./mutation/write.mjs";
import { deleteDnsRecord } from "./mutation/delete.mjs";

export async function handleDnsRecords({
  cf,
  action,
  opts,
  env,
  body,
  outputJson,
  printer = console,
  toJsonOutput,
  fail,
}) {
  const zoneId = getZoneId(opts, env);
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

  if (["create", "update", "delete"].includes(action)) {
    const mutation = {
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
    };
    return action === "delete" ? deleteDnsRecord(mutation) : writeDnsRecord(mutation);
  }

  fail(`Unknown dns-records action: ${action}`);
}
