import { requireValue } from "../argument-validation.mjs";

export async function showList({ cf, accountId, id, outputJson, toJsonOutput, printer, fail }) {
  requireValue(id, "Missing --id", fail);
  const result =
    typeof cf.get === "function"
      ? await cf.get(`/accounts/${accountId}/rules/lists/${id}`, undefined)
      : await cf.rules.lists.get(id, { account_id: accountId });
  return outputJson ? toJsonOutput(result) : printer.log(JSON.stringify(result, null, 2));
}
