import { requireValue } from "./argument-validation.mjs";
import { printTable } from "../output-table.mjs";

export async function handleListsRead({
  action,
  cf,
  accountId,
  id,
  outputJson,
  toJsonOutput,
  printer,
  fail,
}) {
  if (action === "list") {
    const response =
      typeof cf.get === "function"
        ? await cf.get(`/accounts/${accountId}/rules/lists`, undefined)
        : null;
    const items = response ? (Array.isArray(response.result) ? response.result : response) : [];
    if (!response)
      for await (const list of cf.rules.lists.list({ account_id: accountId })) items.push(list);
    return outputJson
      ? toJsonOutput(items)
      : printTable(
          ["ID", "NAME"],
          items.map((list) => [list.id, list.name]),
          printer.log,
        );
  }
  requireValue(id, "Missing --id", fail);
  const result =
    typeof cf.get === "function"
      ? await cf.get(`/accounts/${accountId}/rules/lists/${id}`, undefined)
      : await cf.rules.lists.get(id, { account_id: accountId });
  return outputJson ? toJsonOutput(result) : printer.log(JSON.stringify(result, null, 2));
}
