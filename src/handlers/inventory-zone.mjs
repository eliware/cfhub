export async function collectZoneInventory(cf, zone) {
  const [records, ssl] = await Promise.all([
    typeof cf.get === "function"
      ? cf.get(`/zones/${zone.id}/dns_records`, undefined)
      : cf.dns.records.list({ zone_id: zone.id }),
    typeof cf.get === "function"
      ? cf.get(`/zones/${zone.id}/settings/ssl`, undefined)
      : cf.zones.settings.get(zone.id, "ssl"),
  ]);
  return {
    id: zone.id,
    name: zone.name,
    status: zone.status,
    records: Array.isArray(records?.result) ? records.result : [],
    ssl,
  };
}
