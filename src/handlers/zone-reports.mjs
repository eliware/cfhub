import { getZoneId, requireValue } from "./common.mjs";
import { buildZoneSecurityBaseline } from "./zone-security-baseline.mjs";

export async function handleZoneReport({
  cf,
  action,
  opts,
  outputJson,
  toJsonOutput,
  printer,
  fail,
}) {
  const zoneId = getZoneId(opts);
  requireValue(zoneId, "Missing --zone-id", fail);
  if (action === "audit") {
    const [zone, ssl, dns] = await Promise.all([
      typeof cf.get === "function"
        ? cf.get(`/zones/${zoneId}`, undefined)
        : cf.zones.get({ zone_id: zoneId }),
      typeof cf.get === "function"
        ? cf.get(`/zones/${zoneId}/settings/ssl`, undefined)
        : cf.zones.settings.get(zoneId, "ssl"),
      typeof cf.get === "function"
        ? cf.get(`/zones/${zoneId}/dns_records`, undefined)
        : cf.dns.records.list({ zone_id: zoneId }),
    ]);
    const report = { zone, ssl, dns: Array.isArray(dns?.result) ? dns.result : dns };
    return outputJson ? toJsonOutput(report) : printer.log(JSON.stringify(report, null, 2));
  }
  const result = await cf.get(`/zones/${zoneId}/settings`);
  const report = buildZoneSecurityBaseline(zoneId, result);
  return outputJson ? toJsonOutput(report) : printer.log(JSON.stringify(report, null, 2));
}
