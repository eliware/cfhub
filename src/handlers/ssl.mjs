import { getZoneId } from "./identifiers.mjs";
import { requireValue } from "./argument-validation.mjs";
import { showCertificateCoverage } from "./ssl/certificate-coverage.mjs";

export async function handleSsl({
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
  const setting = opts.setting || "ssl";
  requireValue(zoneId, "Missing --zone-id", fail);
  if (action === "get") {
    const result = await cf.get(`/zones/${zoneId}/settings/${setting}`);
    return outputJson ? toJsonOutput(result) : printer.log(JSON.stringify(result, null, 2));
  }
  if (action === "certificates") {
    const result = await cf.get(`/zones/${zoneId}/ssl/certificate_packs`);
    return outputJson ? toJsonOutput(result) : printer.log(JSON.stringify(result, null, 2));
  }
  if (action === "coverage")
    return showCertificateCoverage({ cf, zoneId, outputJson, toJsonOutput, printer });
  if (action === "set") {
    requireValue(body, "Missing --data or --file", fail);
    if (opts["dry-run"] === true)
      return printer.log(JSON.stringify({ zoneId, setting, body, dryRun: true }, null, 2));
    const result = await cf.patch(`/zones/${zoneId}/settings/${setting}`, { body });
    return outputJson ? toJsonOutput(result) : printer.log(JSON.stringify(result, null, 2));
  }
  fail(`Unknown ssl action: ${action}`);
}
