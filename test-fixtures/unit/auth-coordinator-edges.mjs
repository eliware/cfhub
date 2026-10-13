import { jest } from "@jest/globals";
import { handleAuth } from "../../src/handlers/auth.mjs";
import { authContext } from "../auth-context.mjs";

export async function fixtureCase1() {
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
}

export async function fixtureCase2() {
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
}

export async function fixtureCase3() {
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
}

export async function fixtureCase4() {
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
}

export async function fixtureCase5() {
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
}

export async function fixtureCase6() {
  const ctx = authContext();
  await handleAuth({ ...ctx, action: "list" });
  expect(ctx.toJsonOutput).toHaveBeenCalledWith([
    { name: "environment", active: true, authMethod: "not configured" },
  ]);
}

export async function fixtureCase7() {
  const spy = jest.spyOn(console, "log").mockImplementation(() => {});
  await handleAuth({ action: "list", printer: console });
  expect(spy).toHaveBeenCalled();
  spy.mockRestore();
}

export async function fixtureCase8() {
  await expect(handleAuth()).resolves.toBeUndefined();
}
