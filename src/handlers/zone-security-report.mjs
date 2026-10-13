import { buildZoneSecurityBaseline } from "./zone-security-baseline.mjs";

export async function buildZoneSecurityReport(cf, zoneId) {
  const result = await cf.get(`/zones/${zoneId}/settings`);
  return buildZoneSecurityBaseline(zoneId, result);
}
