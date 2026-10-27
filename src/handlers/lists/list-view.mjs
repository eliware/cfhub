import { printTable } from "../../output/table.mjs";

export async function showLists({ cf, accountId, outputJson, toJsonOutput, printer }) {
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
