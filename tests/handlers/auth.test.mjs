import { jest } from "@jest/globals";
import { handleAuth } from "../../src/handlers/auth.mjs";

test("auth coordinator routes login, profile, status, and verify actions", async () => {
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
  expect(writeCredentialImpl).toHaveBeenCalledWith(
    "work",
    expect.objectContaining({ oauthAccessToken: "access" }),
  );

  await handleAuth({
    action: "login",
    resource: "api-token",
    opts: { "token-stdin": true },
    read: () => ({ profiles: {} }),
    readToken: () => "token",
    inspectApiTokenImpl: jest
      .fn()
      .mockResolvedValue({ permissions: [], permissionsKnown: false, permissionSummary: {} }),
    writeCredentialImpl: jest.fn().mockResolvedValue(true),
    write: jest.fn(),
    printer: { error: jest.fn(), log: jest.fn() },
  });

  const toJsonOutput = jest.fn();
  await handleAuth({
    action: "list",
    read: () => ({ active: "work", profiles: { work: {} } }),
    outputJson: true,
    toJsonOutput,
  });
  expect(toJsonOutput).toHaveBeenCalledWith([{ name: "work", active: true, authMethod: "oauth" }]);

  const previousToken = process.env.CLOUDFLARE_API_TOKEN;
  process.env.CLOUDFLARE_API_TOKEN = "token";
  try {
    const cf = { get: jest.fn().mockResolvedValue({ result: { status: "active" } }) };
    await handleAuth({
      action: "status",
      resource: "auth",
      cf,
      opts: {},
      read: () => data,
      outputJson: true,
      toJsonOutput,
    });
    await handleAuth({
      action: "verify",
      resource: "auth",
      cf,
      opts: {},
      read: () => data,
      outputJson: true,
      toJsonOutput,
    });
    expect(cf.get).toHaveBeenNthCalledWith(1, "/user");
    expect(cf.get).toHaveBeenNthCalledWith(2, "/user/tokens/verify");
  } finally {
    if (previousToken === undefined) delete process.env.CLOUDFLARE_API_TOKEN;
    else process.env.CLOUDFLARE_API_TOKEN = previousToken;
  }

  const fail = jest.fn();
  await handleAuth({ action: "unknown", read: () => data, fail });
  await handleAuth({
    action: "logout",
    opts: {},
    read: () => ({ active: null, profiles: {} }),
    fail,
  });
  expect(fail).toHaveBeenCalledWith("Unknown auth action: unknown");
  await handleAuth();
});
