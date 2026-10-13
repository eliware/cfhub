import { getAccountId, getId } from "./identifiers.mjs";
import { requireValue } from "./argument-validation.mjs";
import { printTable } from "../output-table.mjs";
import { createListItems } from "./list-items-write.mjs";
import { deleteListItems } from "./list-items-delete.mjs";

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
    return createListItems({
      cf,
      accountId,
      id,
      body,
      opts,
      outputJson,
      printer,
      toJsonOutput,
      fail,
    });
  }

  if (action === "delete") {
    return deleteListItems({
      cf,
      accountId,
      id,
      body,
      opts,
      outputJson,
      printer,
      toJsonOutput,
      fail,
    });
  }

  fail(`Unknown list-items action: ${action}`);
}
