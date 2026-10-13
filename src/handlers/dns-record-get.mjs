import { requireValue } from "./argument-validation.mjs";
import { displayDnsRecord } from "./dns-read.mjs";

export async function getDnsRecord({ cf, zoneId, id, outputJson, toJsonOutput, printer, fail }) {
  requireValue(id, "Missing --id", fail);
  const result =
    typeof cf.get === "function"
      ? await cf.get(`/zones/${zoneId}/dns_records/${id}`, undefined)
      : await cf.dns.records.get(id, { zone_id: zoneId });
  return displayDnsRecord(result, { outputJson, toJsonOutput, printer });
}
