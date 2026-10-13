import { jest } from "@jest/globals";
import { handleAuth } from "../../src/handlers/auth.mjs";
import { fs } from "../../src/fs.mjs";
import "../../test-fixtures/unit/auth-coordinator-edges.mjs";

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
