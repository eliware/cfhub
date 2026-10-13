import { handleAuth } from "../../src/handlers/auth.mjs";

import { jest } from "@jest/globals";
import { handleAuthProfile } from "../../src/handlers/auth-profile.mjs";
import { profileOptions } from "../../test-fixtures/auth-profile-options.mjs";
import { authContext } from "../../test-fixtures/auth-context.mjs";

test("auth profile helper lists and activates saved profiles", async () => {
  const data = { active: "work", profiles: { work: { authMethod: "oauth" } } };
  const write = jest.fn();
  const toJsonOutput = jest.fn();
  const base = {
    resource: "oauth",
    opts: { profile: "work" },
    data,
    outputJson: true,
    toJsonOutput,
    printer: { log: jest.fn() },
    fail: jest.fn(),
    write,
    profileHome: "/workspace/test-home",
    profileFs: {},
    readCredentialImpl: jest.fn(),
    revokeOAuthImpl: jest.fn(),
    deleteCredentialImpl: jest.fn(),
  };

  await handleAuthProfile({ ...base, action: "list" });
  await handleAuthProfile({ ...base, action: "switch" });

  expect(toJsonOutput).toHaveBeenCalledWith([{ name: "work", active: true, authMethod: "oauth" }]);
  expect(write).toHaveBeenCalledWith(data, "/workspace/test-home", {});
  expect(data.active).toBe("work");
});

test("auth login does not ask for an account id for a user token", async () => {
  const write = jest.fn();
  const promptAccountId = jest.fn();
  await handleAuth({
    ...authContext(),
    resource: "auth",
    action: "login",
    promptToken: () => "cfut_user-token",
    promptAccountId,
    write,
    writeCredentialImpl: jest.fn().mockResolvedValue(true),
  });
  expect(promptAccountId).not.toHaveBeenCalled();
  expect(write).toHaveBeenCalled();
});

test("auth OAuth login saves and activates the returned token profile", async () => {
  const write = jest.fn();
  const ctx = authContext();
  await handleAuth({
    ...ctx,
    action: "login",
    opts: { profile: "oauth", oauth: true },
    write,
    oauthLogin: jest.fn().mockResolvedValue({
      accessToken: "oauth-token",
      refreshToken: "refresh",
    }),
    writeCredentialImpl: jest.fn().mockResolvedValue(false),
  });
  expect(write).toHaveBeenCalledWith(
    expect.objectContaining({ active: "oauth" }),
    undefined,
    undefined,
  );
});

test("auth verify checks active API tokens", async () => {
  const oldToken = process.env.CLOUDFLARE_API_TOKEN;
  process.env.CLOUDFLARE_API_TOKEN = "token";
  const ctx = authContext();
  ctx.cf.get.mockResolvedValue({ result: { status: "active" } });
  await handleAuth({ ...ctx, action: "verify" });
  expect(ctx.toJsonOutput).toHaveBeenCalledWith({
    verified: true,
    status: "active",
  });
  process.env.CLOUDFLARE_API_TOKEN = oldToken;
});

test("auth logout revokes stored OAuth credentials", async () => {
  const write = jest.fn();
  const revokeOAuthImpl = jest.fn();
  const deleteCredentialImpl = jest.fn();
  const ctx = authContext();
  await handleAuth({
    ...ctx,
    action: "logout",
    opts: { profile: "work" },
    read: () => ({ active: "work", profiles: { work: {} } }),
    write,
    readCredentialImpl: jest.fn().mockResolvedValue({ oauthAccessToken: "oauth-token" }),
    revokeOAuthImpl,
    deleteCredentialImpl,
  });
  expect(revokeOAuthImpl).toHaveBeenCalledWith({ token: "oauth-token" });
  expect(deleteCredentialImpl).toHaveBeenCalledWith("work");
});

test("auth logout clears local credentials when remote revocation fails", async () => {
  const write = jest.fn();
  const remove = jest.fn();
  const ctx = authContext();
  await handleAuth({
    ...ctx,
    resource: "oauth",
    action: "logout",
    read: () => ({ active: "work", profiles: { work: {} } }),
    write,
    readCredentialImpl: jest.fn().mockResolvedValue({ oauthRefreshToken: "expired" }),
    revokeOAuthImpl: jest.fn().mockRejectedValue(new Error("expired")),
    deleteCredentialImpl: remove,
  });
  expect(remove).toHaveBeenCalledWith("work");
  expect(write).toHaveBeenCalledWith({ active: null, profiles: {} }, undefined, undefined);
});

test("auth lists an empty profile store", async () => {
  const ctx = authContext();
  await handleAuth({ ...ctx, action: "list" });
  expect(ctx.toJsonOutput).toHaveBeenCalledWith([
    { name: "environment", active: true, authMethod: "not configured" },
  ]);
});

test("auth uses default dependencies for a profile listing", async () => {
  const spy = jest.spyOn(console, "log").mockImplementation(() => {});
  await handleAuth({ action: "list", printer: console });
  expect(spy).toHaveBeenCalled();
  spy.mockRestore();
});

test("auth can be called with no context object", async () => {
  await expect(handleAuth()).resolves.toBeUndefined();
});

test("profile listing prints active and inactive methods", async () => {
  const printer = { log: jest.fn() };
  await handleAuthProfile(
    profileOptions({
      resource: "auth",
      outputJson: false,
      printer,
      data: { active: "work", profiles: { work: {}, other: { authMethod: "oauth" } } },
    }),
  );
  expect(printer.log).toHaveBeenCalledWith(expect.stringContaining("work   api-token"));
  expect(printer.log).toHaveBeenCalledWith(expect.stringContaining("other  oauth"));
  const oauthPrinter = { log: jest.fn() };
  await handleAuthProfile(
    profileOptions({
      resource: "oauth",
      outputJson: false,
      printer: oauthPrinter,
      data: { active: "work", profiles: { work: {} } },
    }),
  );
  expect(oauthPrinter.log).toHaveBeenCalledWith(expect.stringContaining("work  oauth"));
});

test("profile cleanup handles unknown and inactive profiles", async () => {
  const fail = jest.fn();
  await handleAuthProfile(profileOptions({ action: "unknown" }));
  await handleAuthProfile(profileOptions({ action: "switch", fail }));
  await handleAuthProfile(profileOptions({ action: "logout", fail }));
  await handleAuthProfile(profileOptions({ action: "logout", opts: { profile: "missing" }, fail }));
  const data = { active: "other", profiles: { work: {}, other: {} } };
  const write = jest.fn();
  const printer = { log: jest.fn() };
  await handleAuthProfile(
    profileOptions({
      action: "logout",
      opts: { profile: "work" },
      data,
      deleteCredentialImpl: jest.fn().mockRejectedValue(new Error("local failure")),
      printer,
      write,
    }),
  );
  expect(data).toEqual({ active: "other", profiles: { other: {} } });
  expect(write).toHaveBeenCalled();
  expect(printer.log).toHaveBeenCalledWith("Removed profile work");
});
