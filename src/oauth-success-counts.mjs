export function successPageCounts({ scopes, enabled, zones, dns }) {
  return {
    scopeCount: String(scopes.length),
    enabledCount: String(enabled.length),
    zoneCount: String(zones.length),
    dnsCount: String(dns.length),
  };
}
