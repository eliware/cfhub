import { requireValue } from "./argument-validation.mjs";

export async function deleteListItems({
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
  if (!body || !Array.isArray(body.ids)) fail('Missing --data or --file with {"ids":[...]}');
  requireValue(body.ids.length, "Expected at least one item ID", fail);
  requireValue(opts.force, "Refusing to delete without --force", fail);
  if (opts["dry-run"])
    return printer.log(
      JSON.stringify({ listId: id, action: "delete", body, dryRun: true }, null, 2),
    );
  const items = body.ids.map((itemId) => ({ id: itemId }));
  const result =
    typeof cf.delete === "function"
      ? await cf.delete(`/accounts/${accountId}/rules/lists/${id}/items`, { body: { items } })
      : await cf.rules.lists.items.delete(id, { account_id: accountId, items });
  return outputJson ? toJsonOutput(result) : printer.log(JSON.stringify(result, null, 2));
}
