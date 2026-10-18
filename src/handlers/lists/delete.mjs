import { requireValue } from "../argument-validation.mjs";

export async function handleListsDelete({
  cf,
  accountId,
  id,
  opts,
  outputJson,
  toJsonOutput,
  printer,
  fail,
}) {
  requireValue(id, "Missing --id", fail);
  requireValue(opts.force, "Refusing lists delete without --force", fail);
  if (opts["dry-run"])
    return printer.log(JSON.stringify({ action: "delete", accountId, id, dryRun: true }, null, 2));
  const result = await cf.delete(`/accounts/${accountId}/rules/lists/${id}`);
  return outputJson ? toJsonOutput(result) : printer.log(JSON.stringify(result, null, 2));
}
