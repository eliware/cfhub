import { getAccountId, getZoneId, getId } from "./identifiers.mjs";
import { requireAnyValue } from "./argument-validation.mjs";
import { readRulesets } from "./rulesets-read.mjs";
import { mutateRulesets } from "./rulesets-mutate.mjs";

export async function handleRulesets({
  cf,
  action,
  opts,
  body,
  outputJson,
  printer = console,
  toJsonOutput,
  fail,
}) {
  const zoneId = getZoneId(opts);
  const accountId = getAccountId(opts);
  const id = getId(opts);
  requireAnyValue([zoneId, accountId], "Missing --zone-id or --account-id", fail);

  const shared = {
    cf,
    action,
    opts,
    zoneId,
    accountId,
    id,
    body,
    outputJson,
    toJsonOutput,
    printer,
    fail,
  };
  if (action === "list" || action === "get") return readRulesets(shared);
  if (action === "create" || action === "update") return mutateRulesets(shared);

  fail(`Unknown rulesets action: ${action}`);
}
