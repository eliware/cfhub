import { requireValue } from "./common.mjs";

export async function handleDnsDiff({
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
}) {
  requireValue(body, "Missing desired records in --data or --file", fail);
  const desired = Array.isArray(body) ? body : body.records;
  requireValue(desired, "Expected an array of desired records", fail);
  const currentResponse = await listRecords();
  const current = Array.isArray(currentResponse?.result) ? currentResponse.result : [];
  const key = (record) =>
    JSON.stringify({
      type: record.type,
      name: record.name,
      content: record.content,
      ttl: record.ttl,
      proxied: record.proxied,
    });
  const desiredKeys = new Set(desired.map(key));
  const currentKeys = new Set(current.map(key));
  const add = desired.filter((record) => !currentKeys.has(key(record)));
  const remove = current.filter((record) => !desiredKeys.has(key(record)));
  const plan = {
    zoneId,
    add,
    remove,
    unchanged: current.filter((record) => desiredKeys.has(key(record))),
  };
  if (action === "diff" || opts["dry-run"])
    return outputJson ? toJsonOutput(plan) : printer.log(JSON.stringify(plan, null, 2));
  requireValue(opts.force, "Refusing DNS apply without --force", fail);
  for (const record of add)
    await (typeof cf.post === "function"
      ? cf.post(`/zones/${zoneId}/dns_records`, { body: record })
      : cf.dns.records.create({ zone_id: zoneId, ...record }));
  for (const record of remove)
    await (typeof cf.delete === "function"
      ? cf.delete(`/zones/${zoneId}/dns_records/${record.id}`)
      : cf.dns.records.delete(record.id, { zone_id: zoneId }));
  return outputJson
    ? toJsonOutput({ ...plan, applied: true })
    : printer.log(JSON.stringify({ ...plan, applied: true }, null, 2));
}
