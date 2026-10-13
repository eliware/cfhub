export async function applyDnsPlan(cf, plan) {
  for (const record of plan.add)
    await (typeof cf.post === "function"
      ? cf.post(`/zones/${plan.zoneId}/dns_records`, { body: record })
      : cf.dns.records.create({ zone_id: plan.zoneId, ...record }));
  for (const record of plan.remove)
    await (typeof cf.delete === "function"
      ? cf.delete(`/zones/${plan.zoneId}/dns_records/${record.id}`)
      : cf.dns.records.delete(record.id, { zone_id: plan.zoneId }));
}
