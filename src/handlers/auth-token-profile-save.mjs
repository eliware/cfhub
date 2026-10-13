export function saveTokenProfile({
  data,
  name,
  opts,
  tokenInfo,
  detectedAccountToken,
  accountId,
  write,
  profileHome,
  profileFs,
}) {
  data.profiles[name] = {
    authMethod: detectedAccountToken ? "account-api-token" : "api-token",
    accountId,
    zoneId: opts?.["zone-id"] || process.env.CLOUDFLARE_ZONE_ID,
    apiPermissions: tokenInfo.permissions,
    apiPermissionsKnown: tokenInfo.permissionsKnown,
    apiPermissionSummary: tokenInfo.permissionSummary,
  };
  data.active = name;
  write(data, profileHome, profileFs);
}
