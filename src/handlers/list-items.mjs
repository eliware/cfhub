import { getAccountId, getId, requireValue } from "./common.mjs";
import { printTable } from "../output-table.mjs";

export async function handleListItems({
  cf,
  action,
  opts,
  body,
  outputJson,
  printer = console,
  toJsonOutput,
  fail,
}) {
  const accountId = getAccountId(opts);
  const id = getId(opts);
  requireValue(accountId, "Missing --account-id or CLOUDFLARE_ACCOUNT_ID", fail);
  requireValue(id, "Missing --id", fail);

  if (action === "list") {
    const response =
      typeof cf.get === "function"
        ? await cf.get(`/accounts/${accountId}/rules/lists/${id}/items`, undefined)
        : null;

    const items = response ? (Array.isArray(response.result) ? response.result : response) : [];

    if (!response)
      for await (const item of cf.rules.lists.items.list(id, { account_id: accountId }))
        items.push(item);
    return outputJson
      ? toJsonOutput(items)
      : printTable(
          ["ID", "VALUE"],
          items.map((i) => [i.id, i.value || i.ip || JSON.stringify(i)]),
          printer.log,
        );
  }

  if (action === "create") {
    requireValue(body, "Missing --data or --file", fail);
    if (opts["dry-run"])
      return printer.log(
        JSON.stringify({ listId: id, action: "create", body, dryRun: true }, null, 2),
      );

    const res =
      typeof cf.post === "function"
        ? await cf.post(`/accounts/${accountId}/rules/lists/${id}/items`, {
            body: Array.isArray(body) ? body : [body],
          })
        : await cf.rules.lists.items.create(id, {
            account_id: accountId,
            body: Array.isArray(body) ? body : [body],
          });
    return outputJson ? toJsonOutput(res) : printer.log(JSON.stringify(res, null, 2));
  }

  if (action === "delete") {
    if (!body || !Array.isArray(body.ids)) fail('Missing --data or --file with {"ids":[...]}');
    requireValue(opts.force, "Refusing to delete without --force", fail);

    const res =
      typeof cf.delete === "function"
        ? await cf.delete(`/accounts/${accountId}/rules/lists/${id}/items`, {
            body: { items: body.ids.map((itemId) => ({ id: itemId })) },
          })
        : await cf.rules.lists.items.delete(id, {
            account_id: accountId,
            items: body.ids.map((itemId) => ({ id: itemId })),
          });
    return outputJson ? toJsonOutput(res) : printer.log(JSON.stringify(res, null, 2));
  }

  fail(`Unknown list-items action: ${action}`);
}
