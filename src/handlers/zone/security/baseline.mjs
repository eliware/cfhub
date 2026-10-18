const SECURITY_SETTINGS = ["ssl", "min_tls_version", "always_use_https", "tls_1_3"];

export function buildZoneSecurityBaseline(zoneId, result) {
  const settings = Array.isArray(result?.result) ? result.result : [];
  const baseline = settings.filter((setting) => SECURITY_SETTINGS.includes(setting.id));
  return {
    zoneId,
    settings: baseline,
    missing: SECURITY_SETTINGS.filter((name) => !baseline.some((setting) => setting.id === name)),
  };
}
