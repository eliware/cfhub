import { getZoneId } from "../identifiers.mjs";
import { requireValue } from "../argument-validation.mjs";
import { buildZoneAuditReport } from "./audit-report.mjs";
import { buildZoneSecurityReport } from "./security/report.mjs";

export async function handleZoneReport({
  cf,
  action,
  opts,
  env,
  outputJson,
  toJsonOutput,
  printer,
  fail,
}) {
  const zoneId = getZoneId(opts, env);
  requireValue(zoneId, "Missing --zone-id", fail);
  const report =
    action === "audit"
      ? await buildZoneAuditReport(cf, zoneId)
      : await buildZoneSecurityReport(cf, zoneId);
  return outputJson ? toJsonOutput(report) : printer.log(JSON.stringify(report, null, 2));
}
