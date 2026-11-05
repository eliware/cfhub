import { getAccountId, getId } from "../identifiers.mjs";
import { requireValue } from "../argument-validation.mjs";
import { printTable } from "../../output/table.mjs";
import { createListItems } from "./items/write.mjs";
import { deleteListItems } from "./items/delete.mjs";
import { readListItems } from "./items/read.mjs";

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
    const items = await readListItems({ cf, accountId, listId: id, opts, fail });
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
