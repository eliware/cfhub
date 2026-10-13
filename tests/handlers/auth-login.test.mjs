import { jest } from "@jest/globals";
import { handleAuth } from "../../src/handlers/auth.mjs";

import { handleAuthLogin } from "../../src/handlers/auth-login.mjs";

test("auth login routes OAuth profiles to the OAuth helper", async () => {
  const oauthLogin = async () => ({ accessToken: "token" });
  const writeCredentialImpl = async () => true;
  const write = () => {};
  const data = { profiles: {} };
  await handleAuthLogin({
    data,
    opts: {},
    name: "work",
    oauthLogin,
    writeCredentialImpl,
    write,
  });
  expect(data.profiles.work.authMethod).toBe("oauth");
});

const base = () => ({
  cf: { get: jest.fn().mockResolvedValue({ result: { id: "user-1" } }) },
  outputJson: true,
  printer: { log: jest.fn() },
  toJsonOutput: jest.fn(),
  fail: jest.fn(),
  read: () => ({ active: null, profiles: {} }),
  inspectApiTokenImpl: jest.fn().mockResolvedValue({
    permissions: [],
    permissionsKnown: false,
    permissionSummary: { total: 0, read: 0, write: 0, other: 0 },
  }),
});

test("auth handles an empty token when environment credentials are absent", async () => {
  const oldToken = process.env.CLOUDFLARE_API_TOKEN;
  delete process.env.CLOUDFLARE_API_TOKEN;
  const ctx = base();
  const readFileSync = jest.spyOn(fs, "readFileSync").mockReturnValue("");
  await handleAuth({ ...ctx, resource: "auth", action: "login", opts: { "token-stdin": true } });
  readFileSync.mockRestore();
  expect(ctx.fail).toHaveBeenCalledWith("No API token supplied. Run cfhub auth login again.");
  if (oldToken === undefined) delete process.env.CLOUDFLARE_API_TOKEN;
  else process.env.CLOUDFLARE_API_TOKEN = oldToken;
});

test("auth OAuth login omits the token when keychain storage succeeds", async () => {
  const write = jest.fn();
  const ctx = base();
  await handleAuth({
    ...ctx,
    action: "login",
    opts: { profile: "secure", oauth: true },
    write,
    oauthLogin: jest.fn().mockResolvedValue({ accessToken: "access" }),
    writeCredentialImpl: async () => true,
  });
  expect(write).toHaveBeenCalledWith(
    expect.objectContaining({
      profiles: { secure: expect.not.objectContaining({ apiToken: expect.anything() }) },
    }),
    undefined,
    undefined,
  );
});

test("auth OAuth login accepts configured and requested scopes", async () => {
  const oldScopes = process.env.CFHUB_OAUTH_SCOPES;
  process.env.CFHUB_OAUTH_SCOPES = "custom.read, zone.read";
  const write = jest.fn();
  const oauthLogin = jest
    .fn()
    .mockResolvedValue({ accessToken: "access", scopes: ["custom.read"] });
  const ctx = base();
  await handleAuth({
    ...ctx,
    action: "login",
    opts: {
      profile: "work",
      oauth: true,
      scope: ["extra.read"],
      scopes: ["another.read"],
      "account-id": "acct",
      "zone-id": "zone",
    },
    write,
    oauthLogin,
    writeCredentialImpl: jest.fn().mockResolvedValue(true),
  });
  expect(oauthLogin).toHaveBeenCalledWith(
    expect.objectContaining({
      clientId: expect.any(String),
      scopePicker: true,
      scopes: expect.arrayContaining(["custom.read", "zone.read", "extra.read", "another.read"]),
    }),
  );
  expect(write).toHaveBeenCalledWith(
    expect.objectContaining({
      profiles: {
        work: expect.objectContaining({
          scopes: ["custom.read"],
          accountId: "acct",
          zoneId: "zone",
        }),
      },
    }),
    undefined,
    undefined,
  );
  if (oldScopes === undefined) delete process.env.CFHUB_OAUTH_SCOPES;
  else process.env.CFHUB_OAUTH_SCOPES = oldScopes;
});

test("auth switch, logout, status, and verify report missing credentials or profiles", async () => {
  const ctx = base();
  await handleAuth({ ...ctx, action: "switch", opts: {} });
  await handleAuth({
    ...ctx,
    action: "logout",
    opts: {},
    read: () => ({ active: null, profiles: {} }),
  });
  expect(ctx.fail).toHaveBeenCalledWith("Unknown profile: (missing --profile)");
  expect(ctx.fail).toHaveBeenCalledWith("Unknown profile: (none)");

  const oldToken = process.env.CLOUDFLARE_API_TOKEN;
  delete process.env.CLOUDFLARE_API_TOKEN;
  await handleAuth({ ...ctx, action: "verify" });
  expect(ctx.fail).toHaveBeenCalledWith("cfhub auth verify requires CLOUDFLARE_API_TOKEN");
  if (oldToken === undefined) delete process.env.CLOUDFLARE_API_TOKEN;
  else process.env.CLOUDFLARE_API_TOKEN = oldToken;

  const unknown = base();
  await handleAuth({ ...unknown, action: "unknown" });
  expect(unknown.fail).toHaveBeenCalledWith("Unknown auth action: unknown");
});
import { fs } from "../../src/fs.mjs";
