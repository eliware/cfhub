import { jest } from "@jest/globals";
import { handleAuth } from "../../src/handlers/auth.mjs";
import { fs } from "../../src/fs.mjs";

const emptyProfiles = () => ({ active: null, profiles: {} });

test("auth coordinator routes status and verify actions", async () => {
  const original = process.env.CLOUDFLARE_API_TOKEN;
  process.env.CLOUDFLARE_API_TOKEN = "token";
  try {
    const cf = { get: jest.fn().mockResolvedValue({ result: { id: "user", status: "active" } }) };
    const toJsonOutput = jest.fn();
    const common = {
      resource: "auth",
      cf,
      opts: {},
      read: emptyProfiles,
      outputJson: true,
      toJsonOutput,
    };
    await handleAuth({ ...common, action: "status" });
    await handleAuth({ ...common, action: "verify" });
    expect(cf.get).toHaveBeenNthCalledWith(1, "/user");
    expect(cf.get).toHaveBeenNthCalledWith(2, "/user/tokens/verify");
  } finally {
    if (original === undefined) delete process.env.CLOUDFLARE_API_TOKEN;
    else process.env.CLOUDFLARE_API_TOKEN = original;
  }
});

test("auth coordinator routes profile listing", async () => {
  const toJsonOutput = jest.fn();
  await handleAuth({
    action: "list",
    resource: "auth",
    read: () => ({ active: "team", profiles: { team: {} } }),
    outputJson: true,
    toJsonOutput,
  });
  expect(toJsonOutput).toHaveBeenCalledWith([
    { name: "team", active: true, authMethod: "api-token" },
  ]);
});

test("auth coordinator routes OAuth login", async () => {
  const oauthLogin = jest.fn().mockResolvedValue({
    accessToken: "access",
    refreshToken: "refresh",
    expiresIn: 60,
    expiresAt: "later",
  });
  const writeCredentialImpl = jest.fn();
  const write = jest.fn();
  await handleAuth({
    action: "login",
    opts: { profile: "team" },
    read: emptyProfiles,
    oauthLogin,
    writeCredentialImpl,
    write,
  });
  expect(oauthLogin).toHaveBeenCalled();
  expect(writeCredentialImpl).toHaveBeenCalledWith(
    "team",
    expect.objectContaining({ oauthAccessToken: "access" }),
  );
  expect(write).toHaveBeenCalled();
});

test("auth coordinator routes API-token login", async () => {
  const data = emptyProfiles();
  const write = jest.fn();
  await handleAuth({
    resource: "api-token",
    action: "login",
    opts: { "token-stdin": true },
    read: () => data,
    readToken: () => "token",
    inspectApiTokenImpl: jest
      .fn()
      .mockResolvedValue({ permissions: [], permissionsKnown: false, permissionSummary: {} }),
    writeCredentialImpl: jest.fn().mockResolvedValue(true),
    write,
    printer: { error: jest.fn(), log: jest.fn() },
    fail: (message) => {
      throw new Error(message);
    },
  });
  expect(data.active).toBe("default");
  expect(write).toHaveBeenCalled();
});

test("auth coordinator routes switch, logout, and unknown actions", async () => {
  const data = { active: "team", profiles: { team: { authMethod: "api-token" } } };
  const write = jest.fn();
  await handleAuth({
    action: "switch",
    opts: { profile: "team" },
    read: () => data,
    write,
    printer: { log: jest.fn() },
  });
  await handleAuth({
    action: "logout",
    opts: {},
    read: () => data,
    readCredentialImpl: async () => ({}),
    deleteCredentialImpl: jest.fn(),
    write,
    printer: { log: jest.fn() },
  });
  expect(data.profiles).toEqual({});
  const fail = jest.fn();
  await handleAuth({ action: "switch", opts: {}, read: emptyProfiles, fail });
  await handleAuth({ action: "logout", opts: {}, read: emptyProfiles, fail });
  expect(fail).toHaveBeenCalledWith("Unknown profile: (missing --profile)");
  expect(fail).toHaveBeenCalledWith("Unknown profile: (none)");
  await handleAuth({ action: "unknown", read: emptyProfiles, fail });
  expect(fail).toHaveBeenCalledWith("Unknown auth action: unknown");
});

test("auth coordinator accepts default options", async () => {
  const read = jest.fn(emptyProfiles);
  await handleAuth({ read });
  expect(read).toHaveBeenCalled();
});

test("auth API-token login uses the default stdin reader", async () => {
  const read = jest.spyOn(fs, "readFileSync").mockReturnValue(" token ");
  const data = emptyProfiles();
  await handleAuth({
    resource: "api-token",
    action: "login",
    opts: { "token-stdin": true },
    read: () => data,
    inspectApiTokenImpl: jest
      .fn()
      .mockResolvedValue({ permissions: [], permissionsKnown: false, permissionSummary: {} }),
    writeCredentialImpl: jest.fn().mockResolvedValue(true),
    write: jest.fn(),
    printer: { error: jest.fn(), log: jest.fn() },
    fail: (message) => {
      throw new Error(message);
    },
  });
  expect(read).toHaveBeenCalledWith(0, "utf8");
  read.mockRestore();
});

test("auth coordinator uses default profile storage", async () => {
  await handleAuth();
});

import {
  fixtureCase1,
  fixtureCase2,
  fixtureCase3,
  fixtureCase4,
  fixtureCase5,
  fixtureCase6,
  fixtureCase7,
  fixtureCase8,
} from "../../test-fixtures/unit/auth-coordinator-edges.mjs";

test("auth login does not ask for an account id for a user token", fixtureCase1);
test("auth OAuth login saves and activates the returned token profile", fixtureCase2);
test("auth verify checks active API tokens", fixtureCase3);
test("auth logout revokes stored OAuth credentials", fixtureCase4);
test("auth logout clears local credentials when remote revocation fails", fixtureCase5);
test("auth lists an empty profile store", fixtureCase6);
test("auth uses default dependencies for a profile listing", fixtureCase7);
test("auth can be called with no context object", fixtureCase8);
