import { requireValue } from "../../argument-validation.mjs";

export async function writeDnsRecord({
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
  if (action === "update") requireValue(id, "Missing --id", fail);
  requireValue(body, "Missing --data or --file", fail);
  if (opts["dry-run"])
    return printer.log(
      JSON.stringify(
        { zoneId, ...(action === "update" ? { id } : {}), action, body, dryRun: true },
        null,
        2,
      ),
    );
  const result =
    action === "create"
      ? typeof cf.post === "function"
        ? await cf.post(`/zones/${zoneId}/dns_records`, { body })
        : await cf.dns.records.create({ zone_id: zoneId, ...body })
      : typeof cf.put === "function"
        ? await cf.put(`/zones/${zoneId}/dns_records/${id}`, { body })
        : await cf.dns.records.update(id, { zone_id: zoneId, ...body });
  return outputJson ? toJsonOutput(result) : printer.log(JSON.stringify(result, null, 2));
}
