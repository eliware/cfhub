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
  if (opts["dry-run"] === true)
    return printer.log(JSON.stringify({ action: "delete", accountId, id, dryRun: true }, null, 2));
  requireValue(opts.force, "Refusing lists delete without --force", fail);
  const result = await cf.delete(`/accounts/${accountId}/rules/lists/${id}`);
  return outputJson ? toJsonOutput(result) : printer.log(JSON.stringify(result, null, 2));
}
