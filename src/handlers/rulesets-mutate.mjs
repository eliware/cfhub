import { requireValue } from "./argument-validation.mjs";

export async function mutateRulesets({
  cf,
  action,
  opts,
  zoneId,
  accountId,
  id,
  body,
  outputJson,
  toJsonOutput,
  printer,
  fail,
}) {
  if (action === "update") requireValue(id, "Missing --id", fail);
  requireValue(body, "Missing --data or --file", fail);
  if (opts["dry-run"])
    return printer.log(
      JSON.stringify({ zoneId, accountId, id, action, body, dryRun: true }, null, 2),
    );
  const collection = zoneId ? `/zones/${zoneId}/rulesets` : `/accounts/${accountId}/rulesets`;
  const target =
    action === "create"
      ? typeof cf.post === "function"
        ? await cf.post(collection, { body })
        : await cf.rulesets.create({
            ...(zoneId ? { zone_id: zoneId } : { account_id: accountId }),
            ...body,
          })
      : typeof cf.put === "function"
        ? await cf.put(`${collection}/${id}`, { body })
        : await cf.rulesets.update(id, {
            ...(zoneId ? { zone_id: zoneId } : { account_id: accountId }),
            ...body,
          });
  return outputJson ? toJsonOutput(target) : printer.log(JSON.stringify(target, null, 2));
}
