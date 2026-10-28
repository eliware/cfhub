import { requireValue } from "../../argument-validation.mjs";

export async function deleteDnsRecord({
  zoneId,
  id,
  opts,
  cf,
  outputJson,
  toJsonOutput,
  printer,
  fail,
}) {
  requireValue(id, "Missing --id", fail);
  if (opts["dry-run"] === true)
    return printer.log(JSON.stringify({ action: "delete", zoneId, id, dryRun: true }, null, 2));
  requireValue(opts.force, "Refusing to delete without --force", fail);
  const result =
    typeof cf.delete === "function"
      ? await cf.delete(`/zones/${zoneId}/dns_records/${id}`)
      : await cf.dns.records.delete(id, { zone_id: zoneId });
  return outputJson ? toJsonOutput(result) : printer.log(JSON.stringify(result, null, 2));
}
