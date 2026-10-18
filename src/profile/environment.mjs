export function applyProfileEnvironment(values, env) {
  for (const [key, value] of Object.entries({
    CLOUDFLARE_API_TOKEN: values.oauthAccessToken || values.apiToken,
    CLOUDFLARE_ACCOUNT_ID: values.accountId,
    CLOUDFLARE_ZONE_ID: values.zoneId,
    CFHUB_OAUTH_SCOPES: values.scopes?.join(","),
    CFHUB_API_PERMISSIONS: values.apiPermissions?.join(","),
    CFHUB_API_PERMISSIONS_KNOWN: values.apiPermissionsKnown ? "1" : undefined,
  })) {
    if (value && !env[key]) env[key] = value;
  }
}
