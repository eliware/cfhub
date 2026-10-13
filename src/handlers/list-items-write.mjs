import { requireValue } from "./argument-validation.mjs";

export async function createListItems({
  cf,
  accountId,
  id,
  body,
  opts,
  outputJson,
  printer,
  toJsonOutput,
  fail,
}) {
  requireValue(body, "Missing --data or --file", fail);
  if (opts["dry-run"])
    return printer.log(
      JSON.stringify({ listId: id, action: "create", body, dryRun: true }, null, 2),
    );
  const items = Array.isArray(body) ? body : [body];
  const result =
    typeof cf.post === "function"
      ? await cf.post(`/accounts/${accountId}/rules/lists/${id}/items`, { body: items })
      : await cf.rules.lists.items.create(id, { account_id: accountId, body: items });
  return outputJson ? toJsonOutput(result) : printer.log(JSON.stringify(result, null, 2));
}
