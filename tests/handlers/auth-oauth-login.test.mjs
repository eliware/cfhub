import { jest } from "@jest/globals";
import { saveOAuthLogin } from "../../src/handlers/auth-oauth-login.mjs";

const originalEnv = {
  scopes: process.env.CFHUB_OAUTH_SCOPES,
  clientId: process.env.CFHUB_OAUTH_CLIENT_ID,
  account: process.env.CLOUDFLARE_ACCOUNT_ID,
  zone: process.env.CLOUDFLARE_ZONE_ID,
};
afterEach(() => {
  for (const [key, value] of [
    ["CFHUB_OAUTH_SCOPES", originalEnv.scopes],
    ["CFHUB_OAUTH_CLIENT_ID", originalEnv.clientId],
    ["CLOUDFLARE_ACCOUNT_ID", originalEnv.account],
    ["CLOUDFLARE_ZONE_ID", originalEnv.zone],
  ]) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

test("OAuth login stores scopes returned by the server", async () => {
  const data = { profiles: {} };
  await saveOAuthLogin({
    data,
    opts: {},
    name: "work",
    oauthLogin: async () => ({ accessToken: "t", scopes: ["zone.read"] }),
    writeCredentialImpl: async () => true,
    write: () => {},
  });
  expect(data.profiles.work.scopes).toEqual(["zone.read"]);
});

test("OAuth login combines configured and requested scopes", async () => {
  process.env.CFHUB_OAUTH_SCOPES = " zone:read, ,dns:read ";
  process.env.CFHUB_OAUTH_CLIENT_ID = "configured-client";
  process.env.CLOUDFLARE_ACCOUNT_ID = "env-account";
  process.env.CLOUDFLARE_ZONE_ID = "env-zone";
  const data = { profiles: {} };
  const oauthLogin = async (options) => {
    expect(options.clientId).toBe("configured-client");
    expect(options.scopePicker).toBe(false);
    expect(options.scopes).toEqual(
      expect.arrayContaining(["zone:read", "dns:read", "one", "two", "three"]),
    );
    return { accessToken: "t", refreshToken: "r" };
  };
  const write = jest.fn();
  await saveOAuthLogin({
    data,
    opts: { scopes: ["one,two"], scope: "three", "no-scope-picker": true },
    name: "environment",
    oauthLogin,
    writeCredentialImpl: jest.fn().mockResolvedValue(true),
    write,
  });
  expect(data.profiles.environment).toEqual(
    expect.objectContaining({ authMethod: "oauth", accountId: "env-account", zoneId: "env-zone" }),
  );
  expect(write).toHaveBeenCalledWith(data, undefined, undefined);
});

test("OAuth login uses the injected environment for options and profile IDs", async () => {
  const data = { profiles: {} };
  const env = {
    CFHUB_OAUTH_CLIENT_ID: "injected-client",
    CFHUB_OAUTH_SCOPES: "dns.read",
    CLOUDFLARE_ACCOUNT_ID: "injected-account",
    CLOUDFLARE_ZONE_ID: "injected-zone",
  };
  const oauthLogin = jest.fn().mockResolvedValue({ accessToken: "t", scopes: ["dns.read"] });
  await saveOAuthLogin({
    data,
    env,
    opts: {},
    name: "injected",
    oauthLogin,
    writeCredentialImpl: jest.fn().mockResolvedValue(true),
    write: jest.fn(),
  });
  expect(oauthLogin).toHaveBeenCalledWith(
    expect.objectContaining({ clientId: "injected-client", pickerScopes: ["dns.read"] }),
  );
  expect(data.profiles.injected).toMatchObject({
    accountId: "injected-account",
    zoneId: "injected-zone",
  });
});
