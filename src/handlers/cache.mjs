import { getZoneId } from "./identifiers.mjs";
import { requireValue } from "./argument-validation.mjs";

export async function handleCache({
  cf,
  action,
  opts,
  env,
  body,
  outputJson,
  printer,
  toJsonOutput,
  fail,
}) {
  const zoneId = getZoneId(opts, env);
  requireValue(zoneId, "Missing --zone-id", fail);
  if (action !== "purge") {
    fail(`Unknown cache action: ${action}`);
    return;
  }
  requireValue(body, "Missing --data or --file", fail);
  const dryRun = opts["dry-run"] === true;
  if (!opts.force && !dryRun) {
    fail("Refusing cache removal without --force");
    return;
  }
  if (dryRun) return printer.log(JSON.stringify({ zoneId, action, body, dryRun: true }, null, 2));
  const result = await cf.post(`/zones/${zoneId}/purge_cache`, { body });
  return outputJson ? toJsonOutput(result) : printer.log(JSON.stringify(result, null, 2));
}
