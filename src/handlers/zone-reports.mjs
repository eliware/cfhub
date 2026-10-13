import { getZoneId, requireValue } from "./common.mjs";

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
      cf.get(`/zones/${zoneId}/settings/ssl`, undefined),
      cf.get(`/zones/${zoneId}/dns_records`, undefined),
    ]);
    const report = { zone, ssl, dns: Array.isArray(dns?.result) ? dns.result : dns };
    return outputJson ? toJsonOutput(report) : printer.log(JSON.stringify(report, null, 2));
  }
  const result = await cf.get(`/zones/${zoneId}/settings`);
  const settings = Array.isArray(result?.result) ? result.result : [];
  const names = new Set(["ssl", "min_tls_version", "always_use_https", "tls_1_3"]);
  const baseline = settings.filter((setting) => names.has(setting.id));
  const report = {
    zoneId,
    settings: baseline,
    missing: [...names].filter((name) => !baseline.some((setting) => setting.id === name)),
  };
  return outputJson ? toJsonOutput(report) : printer.log(JSON.stringify(report, null, 2));
}
