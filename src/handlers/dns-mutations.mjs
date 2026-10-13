import { requireValue } from "./common.mjs";

export async function handleDnsMutation({
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
}) {
  if (action === "create") {
    requireValue(body, "Missing --data or --file", fail);
    if (opts["dry-run"])
      return printer.log(JSON.stringify({ zoneId, action: "create", body, dryRun: true }, null, 2));
    const result =
      typeof cf.post === "function"
        ? await cf.post(`/zones/${zoneId}/dns_records`, { body })
        : await cf.dns.records.create({ zone_id: zoneId, ...body });
    return outputJson ? toJsonOutput(result) : printer.log(JSON.stringify(result, null, 2));
  }
  if (action === "update") {
    requireValue(id, "Missing --id", fail);
    requireValue(body, "Missing --data or --file", fail);
    if (opts["dry-run"])
      return printer.log(
        JSON.stringify({ zoneId, id, action: "update", body, dryRun: true }, null, 2),
      );
    const result =
      typeof cf.put === "function"
        ? await cf.put(`/zones/${zoneId}/dns_records/${id}`, { body })
        : await cf.dns.records.update(id, { zone_id: zoneId, ...body });
    return outputJson ? toJsonOutput(result) : printer.log(JSON.stringify(result, null, 2));
  }
  requireValue(id, "Missing --id", fail);
  requireValue(opts.force, "Refusing to delete without --force", fail);
  const result =
    typeof cf.delete === "function"
      ? await cf.delete(`/zones/${zoneId}/dns_records/${id}`)
      : await cf.dns.records.delete(id, { zone_id: zoneId });
  return outputJson ? toJsonOutput(result) : printer.log(JSON.stringify(result, null, 2));
}
