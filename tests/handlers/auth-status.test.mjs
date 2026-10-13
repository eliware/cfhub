import { afterEach, jest } from "@jest/globals";
import { handleAuthStatus } from "../../src/handlers/auth-status.mjs";
import { authStatusContext } from "../../test-fixtures/auth-status-context.mjs";

const originalEnv = {
  token: process.env.CLOUDFLARE_API_TOKEN,
  profile: process.env.CLOUDFLARE_PROFILE,
  account: process.env.CLOUDFLARE_ACCOUNT_ID,
};
afterEach(() => {
  for (const [name, value] of [
    ["CLOUDFLARE_API_TOKEN", originalEnv.token],
    ["CLOUDFLARE_PROFILE", originalEnv.profile],
    ["CLOUDFLARE_ACCOUNT_ID", originalEnv.account],
  ]) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});

test("auth status helper reports a verified OAuth identity", async () => {
  const priorToken = process.env.CLOUDFLARE_API_TOKEN;
  process.env.CLOUDFLARE_API_TOKEN = "token";
  const toJsonOutput = jest.fn();
  try {
    await handleAuthStatus({
      action: "status",
      resource: "oauth",
      opts: {},
      cf: { get: jest.fn().mockResolvedValue({ result: { id: "user-1" } }) },
      data: { active: null, profiles: {} },
      outputJson: true,
      toJsonOutput,
      printer: { log: jest.fn() },
      fail: jest.fn(),
    });
  } finally {
    if (priorToken === undefined) delete process.env.CLOUDFLARE_API_TOKEN;
    else process.env.CLOUDFLARE_API_TOKEN = priorToken;
  }
  expect(toJsonOutput).toHaveBeenCalledWith({
    authenticated: true,
    profile: "environment",
    method: "oauth",
    id: "user-1",
    email: null,
  });
});

test("status reports missing credentials and default API-token identity", async () => {
  delete process.env.CLOUDFLARE_API_TOKEN;
  const fail = jest.fn();
  await handleAuthStatus(authStatusContext({ fail }));
  expect(fail).toHaveBeenCalledWith("You are not logged into Cloudflare. Run: cfhub auth login");

  process.env.CLOUDFLARE_API_TOKEN = "user-token";
  const printer = { log: jest.fn() };
  await handleAuthStatus(authStatusContext({ outputJson: false, printer }));
  expect(printer.log).toHaveBeenCalledWith("environment authenticated");
});

test("status lists accounts when an account token has no selected account", async () => {
  process.env.CLOUDFLARE_API_TOKEN = "cfat_token";
  delete process.env.CLOUDFLARE_ACCOUNT_ID;
  const cf = { get: jest.fn().mockResolvedValue({}) };
  const toJsonOutput = jest.fn();
  await handleAuthStatus(authStatusContext({ cf, toJsonOutput }));
  expect(cf.get).toHaveBeenCalledWith("/accounts");
  expect(toJsonOutput).toHaveBeenCalledWith(
    expect.objectContaining({ accountId: null, accounts: [] }),
  );
});

test("account status selects account IDs from options, profiles, or environment", async () => {
  process.env.CLOUDFLARE_API_TOKEN = "cfat_token";
  process.env.CLOUDFLARE_PROFILE = "selected";
  process.env.CLOUDFLARE_ACCOUNT_ID = "env-account";
  const get = jest.fn().mockResolvedValue({ result: { id: "account" } });
  const printer = { log: jest.fn() };
  const common = { cf: { get }, outputJson: false, printer };
  await handleAuthStatus(
    authStatusContext({ ...common, opts: { "account-id": "option-account" } }),
  );
  await handleAuthStatus(
    authStatusContext({
      ...common,
      opts: {},
      data: { active: "active", profiles: { selected: { accountId: "profile-account" } } },
    }),
  );
  await handleAuthStatus(
    authStatusContext({ ...common, opts: {}, data: { active: null, profiles: {} } }),
  );
  expect(get.mock.calls.map(([url]) => url)).toEqual([
    "/accounts/option-account",
    "/accounts/profile-account",
    "/accounts/env-account",
  ]);
  expect(printer.log).toHaveBeenCalledWith("selected authenticated with account API token");
});

test("user status reports profile identity and email", async () => {
  process.env.CLOUDFLARE_API_TOKEN = "user-token";
  delete process.env.CLOUDFLARE_PROFILE;
  const printer = { log: jest.fn() };
  const toJsonOutput = jest.fn();
  await handleAuthStatus(
    authStatusContext({
      cf: {
        get: jest.fn().mockResolvedValue({ result: { id: "user-1", email: "u@example.com" } }),
      },
      data: { active: "work", profiles: { work: { authMethod: "api-token" } } },
      outputJson: false,
      printer,
      toJsonOutput,
    }),
  );
  expect(printer.log).toHaveBeenCalledWith("work authenticated as u@example.com");
});

test("verify checks user and account tokens and reports missing credentials", async () => {
  delete process.env.CLOUDFLARE_API_TOKEN;
  const fail = jest.fn();
  await handleAuthStatus(authStatusContext({ action: "verify", fail }));
  expect(fail).toHaveBeenCalledWith("cfhub auth verify requires CLOUDFLARE_API_TOKEN");

  process.env.CLOUDFLARE_API_TOKEN = "cfat_token";
  await handleAuthStatus(authStatusContext({ action: "verify", fail }));
  expect(fail).toHaveBeenCalledWith(
    "Account API token verification requires --account-id or CLOUDFLARE_ACCOUNT_ID",
  );

  process.env.CLOUDFLARE_API_TOKEN = "user-token";
  const toJsonOutput = jest.fn();
  const cf = { get: jest.fn().mockResolvedValue({ result: { status: "active" } }) };
  await handleAuthStatus(authStatusContext({ action: "verify", cf, toJsonOutput }));
  expect(cf.get).toHaveBeenCalledWith("/user/tokens/verify");
  expect(toJsonOutput).toHaveBeenCalledWith({ verified: true, status: "active" });
});

test("status uses the default API-token method without a saved profile", async () => {
  process.env.CLOUDFLARE_API_TOKEN = "user-token";
  delete process.env.CLOUDFLARE_PROFILE;
  const toJsonOutput = jest.fn();
  await handleAuthStatus(authStatusContext({ toJsonOutput }));
  expect(toJsonOutput).toHaveBeenCalledWith(
    expect.objectContaining({ profile: "environment", method: "api-token", id: null, email: null }),
  );
});

test("verify checks account tokens and reports unknown status as text", async () => {
  process.env.CLOUDFLARE_API_TOKEN = "cfat_token";
  process.env.CLOUDFLARE_ACCOUNT_ID = "account-1";
  const cf = { get: jest.fn().mockResolvedValue({}) };
  const printer = { log: jest.fn() };
  await handleAuthStatus(authStatusContext({ action: "verify", cf, outputJson: false, printer }));
  expect(cf.get).toHaveBeenCalledWith("/accounts/account-1/tokens/verify");
  expect(printer.log).toHaveBeenCalledWith("unknown");
});

test("status helper ignores unknown actions", async () => {
  const cf = { get: jest.fn() };
  await handleAuthStatus(authStatusContext({ action: "unknown", cf }));
  expect(cf.get).not.toHaveBeenCalled();
});
