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
  if (!body || !Array.isArray(body.ids)) {
    fail('Missing --data or --file with {"ids":[...]}');
    return;
  }
  if (!body.ids.length) {
    fail("Expected at least one item ID");
    return;
  }
  if (!opts.force) {
    fail("Refusing to delete without --force");
    return;
  }
  if (opts["dry-run"] === true)
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
