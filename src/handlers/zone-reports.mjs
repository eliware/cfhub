import { getZoneId } from "./identifiers.mjs";
import { requireValue } from "./argument-validation.mjs";
import { buildZoneAuditReport } from "./zone-audit-report.mjs";
import { buildZoneSecurityReport } from "./zone-security-report.mjs";

export async function handleZoneReport({
  cf,
  action,
  opts,
  outputJson,
  toJsonOutput,
  printer,
  fail,
}) {
  const zoneId = getZoneId(opts);
  requireValue(zoneId, "Missing --zone-id", fail);
  const report =
    action === "audit"
      ? await buildZoneAuditReport(cf, zoneId)
      : await buildZoneSecurityReport(cf, zoneId);
  return outputJson ? toJsonOutput(report) : printer.log(JSON.stringify(report, null, 2));
}
