import { authOAuthOptions } from "../../src/handlers/auth-oauth-options.mjs";

test("combines default, environment, and command scopes without duplicates", () => {
  const result = authOAuthOptions(
    { scopes: ["zone.write,dns.read"], scope: "dns.read", "no-scope-picker": true },
    {
      CFHUB_OAUTH_SCOPES: "zone.read,account.read",
      CFHUB_OAUTH_CLIENT_ID: "client",
      CFHUB_OAUTH_BIND_HOST: "0.0.0.0",
      CFHUB_OAUTH_REDIRECT_HOST: "localhost",
    },
  );
  expect(result.clientId).toBe("client");
  expect(result.scopes).toEqual(
    expect.arrayContaining([
      "user-details.read",
      "zone.read",
      "account.read",
      "zone.write",
      "dns.read",
    ]),
  );
  expect(new Set(result.scopes).size).toBe(result.scopes.length);
  expect(result).toMatchObject({
    scopePicker: false,
    bindHost: "0.0.0.0",
    redirectHost: "localhost",
  });
});

test("uses default client and host values", () => {
  expect(authOAuthOptions({}, {})).toMatchObject({
    scopePicker: true,
    bindHost: "127.0.0.1",
    redirectHost: "127.0.0.1",
  });
});

test("uses process scopes when options are omitted", () => {
  expect(authOAuthOptions(undefined, {}).scopes).toContain("user-details.read");
});
