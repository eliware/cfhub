import { requireValue } from "./argument-validation.mjs";

export async function handleListsWrite({
  action,
  cf,
  accountId,
  id,
  body,
  opts,
  outputJson,
  toJsonOutput,
  printer,
  fail,
}) {
  const base = `/accounts/${accountId}/rules/lists`;
  if (action === "create") {
    requireValue(body, "Missing --data or --file", fail);
    if (opts["dry-run"])
      return printer.log(JSON.stringify({ action, accountId, body, dryRun: true }, null, 2));
    const result = await cf.post(base, { body });
    return outputJson ? toJsonOutput(result) : printer.log(JSON.stringify(result, null, 2));
  }
  requireValue(id, "Missing --id", fail);
  requireValue(body, "Missing --data or --file", fail);
  if (opts["dry-run"])
    return printer.log(JSON.stringify({ action, accountId, id, body, dryRun: true }, null, 2));
  const result = await cf.put(`${base}/${id}`, { body });
  return outputJson ? toJsonOutput(result) : printer.log(JSON.stringify(result, null, 2));
}
