import { applyProfileEnvironment } from "../src/profile-environment.mjs";

test("maps profile credentials and permissions into missing environment values", () => {
  const env = { CLOUDFLARE_ZONE_ID: "existing-zone" };
  applyProfileEnvironment(
    {
      apiToken: "token",
      accountId: "account",
      zoneId: "profile-zone",
      scopes: ["zone.read", "dns.read"],
      apiPermissions: ["Zone Read"],
      apiPermissionsKnown: true,
    },
    env,
  );
  expect(env).toEqual({
    CLOUDFLARE_API_TOKEN: "token",
    CLOUDFLARE_ACCOUNT_ID: "account",
    CLOUDFLARE_ZONE_ID: "existing-zone",
    CFHUB_OAUTH_SCOPES: "zone.read,dns.read",
    CFHUB_API_PERMISSIONS: "Zone Read",
    CFHUB_API_PERMISSIONS_KNOWN: "1",
  });
});
