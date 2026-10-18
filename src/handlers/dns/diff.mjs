import { requireValue } from "../argument-validation.mjs";
import { buildDnsPlan } from "./plan.mjs";
import { applyDnsPlan } from "./apply-plan.mjs";

export async function handleDnsDiff({
  action,
  zoneId,
  opts,
  body,
  outputJson,
  printer,
  toJsonOutput,
  fail,
  cf,
  listRecords,
}) {
  requireValue(body, "Missing target records in --data or --file", fail);
  const targetRecords = Array.isArray(body) ? body : body.records;
  if (!Array.isArray(targetRecords)) fail("Expected an array of target records");
  const currentResponse = await listRecords();
  const current = Array.isArray(currentResponse?.result) ? currentResponse.result : [];
  const plan = buildDnsPlan(zoneId, targetRecords, current);
  if (action === "diff" || opts["dry-run"])
    return outputJson ? toJsonOutput(plan) : printer.log(JSON.stringify(plan, null, 2));
  requireValue(opts.force, "Refusing DNS apply without --force", fail);
  await applyDnsPlan(cf, plan);
  return outputJson
    ? toJsonOutput({ ...plan, applied: true })
    : printer.log(JSON.stringify({ ...plan, applied: true }, null, 2));
}
