import { jest } from "@jest/globals";
import { handleAuth } from "../../src/handlers/auth.mjs";

test("auth coordinator routes OAuth login", async () => {
  const data = { active: null, profiles: {} };
  const oauthLogin = jest.fn().mockResolvedValue({ accessToken: "access" });
  const writeCredentialImpl = jest.fn().mockResolvedValue(true);
  const write = jest.fn();
  await handleAuth({
    action: "login",
    opts: { profile: "work" },
    read: () => data,
    oauthLogin,
    writeCredentialImpl,
    write,
  });
  expect(oauthLogin).toHaveBeenCalled();
  expect(writeCredentialImpl).toHaveBeenCalled();
  expect(write).toHaveBeenCalled();
});

test("auth coordinator routes API token login", async () => {
  const inspectApiTokenImpl = jest.fn().mockResolvedValue({
    permissions: [],
    permissionsKnown: false,
    permissionSummary: {},
  });
  await handleAuth({
    action: "login",
    resource: "api-token",
    opts: { "token-stdin": true },
    read: () => ({ profiles: {} }),
    readToken: () => "token",
    inspectApiTokenImpl,
    writeCredentialImpl: jest.fn().mockResolvedValue(true),
    write: jest.fn(),
    printer: { error: jest.fn(), log: jest.fn() },
  });
  expect(inspectApiTokenImpl).toHaveBeenCalledWith({ token: "token", accountId: undefined });
});

test("auth coordinator routes profile listing", async () => {
  const toJsonOutput = jest.fn();
  await handleAuth({
    action: "list",
    read: () => ({ active: "work", profiles: { work: {} } }),
    outputJson: true,
    toJsonOutput,
  });
  expect(toJsonOutput).toHaveBeenCalled();
});

test.each([
  ["status", "/user"],
  ["verify", "/user/tokens/verify"],
])("auth coordinator routes %s to %s", async (action, endpoint) => {
  const previousToken = process.env.CLOUDFLARE_API_TOKEN;
  process.env.CLOUDFLARE_API_TOKEN = "token";
  try {
    const cf = { get: jest.fn().mockResolvedValue({ result: { status: "active" } }) };
    await handleAuth({
      action,
      resource: "auth",
      cf,
      opts: {},
      read: () => ({ active: null, profiles: {} }),
      outputJson: true,
      toJsonOutput: jest.fn(),
    });
    expect(cf.get).toHaveBeenCalledWith(endpoint);
  } finally {
    if (previousToken === undefined) delete process.env.CLOUDFLARE_API_TOKEN;
    else process.env.CLOUDFLARE_API_TOKEN = previousToken;
  }
});

test("auth coordinator reports unknown actions", async () => {
  const fail = jest.fn();
  await handleAuth({ action: "unknown", read: () => ({ active: null, profiles: {} }), fail });
  expect(fail).toHaveBeenCalledWith("Unknown auth action: unknown");
  await expect(handleAuth()).resolves.toBeUndefined();
});

test("auth coordinator sends logout through the profile workflow", async () => {
  const data = { active: "work", profiles: { work: {} } };
  const write = jest.fn();
  const log = jest.fn();
  await handleAuth({
    action: "logout",
    opts: {},
    read: () => data,
    readCredentialImpl: jest.fn().mockResolvedValue(null),
    deleteCredentialImpl: jest.fn(),
    write,
    printer: { log },
    profileHome: "/tmp/profiles",
    profileFs: {},
  });
  expect(write).toHaveBeenCalled();
  expect(log).toHaveBeenCalled();
});
