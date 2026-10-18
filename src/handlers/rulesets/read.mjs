import { requireValue } from "../argument-validation.mjs";

export async function readRulesets({
  cf,
  action,
  zoneId,
  accountId,
  id,
  outputJson,
  toJsonOutput,
  printer,
  fail,
}) {
  if (action === "get") requireValue(id, "Missing --id", fail);
  const collection = zoneId ? `/zones/${zoneId}/rulesets` : `/accounts/${accountId}/rulesets`;
  const target =
    typeof cf.get === "function"
      ? await cf.get(action === "get" ? `${collection}/${id}` : collection, undefined)
      : action === "get"
        ? await cf.rulesets.get(id, zoneId ? { zone_id: zoneId } : { account_id: accountId })
        : await cf.rulesets.list(zoneId ? { zone_id: zoneId } : { account_id: accountId });
  return outputJson ? toJsonOutput(target) : printer.log(JSON.stringify(target, null, 2));
}
