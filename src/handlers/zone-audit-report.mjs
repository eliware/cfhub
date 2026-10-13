export async function buildZoneAuditReport(cf, zoneId) {
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
  return { zone, ssl, dns: Array.isArray(dns?.result) ? dns.result : dns };
}
