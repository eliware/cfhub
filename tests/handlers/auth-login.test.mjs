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
