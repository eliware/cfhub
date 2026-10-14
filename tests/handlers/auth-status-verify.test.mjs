import { jest } from "@jest/globals";
import { verifyAuthStatus } from "../../src/handlers/auth-status-verify.mjs";

test("token verification uses the matching endpoint", async () => {
  const previous = process.env.CLOUDFLARE_API_TOKEN;
  process.env.CLOUDFLARE_API_TOKEN = "cfat_account-token";
  try {
    const cf = { get: jest.fn().mockResolvedValue({ result: { status: "active" } }) };
    const toJsonOutput = jest.fn();
    await verifyAuthStatus({
      opts: { "account-id": "account" },
      cf,
      data: { active: null, profiles: {} },
      outputJson: true,
      toJsonOutput,
      printer: { log: jest.fn() },
      fail: jest.fn(),
    });
    expect(cf.get).toHaveBeenCalledWith("/accounts/account/tokens/verify");
    expect(toJsonOutput).toHaveBeenCalledWith({ verified: true, status: "active" });
  } finally {
    if (previous === undefined) delete process.env.CLOUDFLARE_API_TOKEN;
    else process.env.CLOUDFLARE_API_TOKEN = previous;
  }
});

test("verification stops when the API token is absent", async () => {
  const prior = process.env.CLOUDFLARE_API_TOKEN;
  delete process.env.CLOUDFLARE_API_TOKEN;
  const fail = jest.fn();
  try {
    await verifyAuthStatus({
      opts: {},
      cf: { get: jest.fn() },
      data: { active: null, profiles: {} },
      outputJson: false,
      printer: { log: jest.fn() },
      fail,
    });
  } finally {
    if (prior === undefined) delete process.env.CLOUDFLARE_API_TOKEN;
    else process.env.CLOUDFLARE_API_TOKEN = prior;
  }
  expect(fail).toHaveBeenCalledWith("cfhub auth verify requires CLOUDFLARE_API_TOKEN");
});

test("token verification reports a missing account ID", async () => {
  const previous = process.env.CLOUDFLARE_API_TOKEN;
  process.env.CLOUDFLARE_API_TOKEN = "cfat_account-token";
  try {
    const fail = jest.fn();
    await verifyAuthStatus({
      opts: {},
      cf: { get: jest.fn() },
      data: { active: null, profiles: {} },
      outputJson: false,
      toJsonOutput: jest.fn(),
      printer: { log: jest.fn() },
      fail,
    });
    expect(fail).toHaveBeenCalledWith(
      "Account API token verification requires --account-id or CLOUDFLARE_ACCOUNT_ID",
    );
  } finally {
    if (previous === undefined) delete process.env.CLOUDFLARE_API_TOKEN;
    else process.env.CLOUDFLARE_API_TOKEN = previous;
  }
});

test("account ID resolution follows option, saved profile, and environment order", async () => {
  const oldToken = process.env.CLOUDFLARE_API_TOKEN;
  const oldAccount = process.env.CLOUDFLARE_ACCOUNT_ID;
  process.env.CLOUDFLARE_API_TOKEN = "cfat_account-token";
  process.env.CLOUDFLARE_ACCOUNT_ID = "environment";
  const cf = { get: jest.fn().mockResolvedValue({ result: { status: "active" } }) };
  const args = {
    cf,
    data: { active: "work", profiles: { work: { accountId: "saved" } } },
    outputJson: true,
    toJsonOutput: jest.fn(),
    printer: { log: jest.fn() },
    fail: (message) => {
      throw new Error(message);
    },
  };
  try {
    await verifyAuthStatus({ ...args, opts: { "account-id": "option" } });
    expect(cf.get).toHaveBeenLastCalledWith("/accounts/option/tokens/verify");
    await verifyAuthStatus({ ...args, opts: {} });
    expect(cf.get).toHaveBeenLastCalledWith("/accounts/saved/tokens/verify");
    await verifyAuthStatus({ ...args, data: { active: null, profiles: {} }, opts: {} });
    expect(cf.get).toHaveBeenLastCalledWith("/accounts/environment/tokens/verify");
  } finally {
    if (oldToken === undefined) delete process.env.CLOUDFLARE_API_TOKEN;
    else process.env.CLOUDFLARE_API_TOKEN = oldToken;
    if (oldAccount === undefined) delete process.env.CLOUDFLARE_ACCOUNT_ID;
    else process.env.CLOUDFLARE_ACCOUNT_ID = oldAccount;
  }
});

test("account token verification requires an account ID", async () => {
  const oldToken = process.env.CLOUDFLARE_API_TOKEN;
  const oldAccount = process.env.CLOUDFLARE_ACCOUNT_ID;
  process.env.CLOUDFLARE_API_TOKEN = "cfat_account-token";
  delete process.env.CLOUDFLARE_ACCOUNT_ID;
  const fail = jest.fn((message) => {
    throw new Error(message);
  });
  try {
    await expect(
      verifyAuthStatus({
        opts: {},
        cf: { get: jest.fn() },
        data: { active: null, profiles: {} },
        fail,
      }),
    ).rejects.toThrow(
      "Account API token verification requires --account-id or CLOUDFLARE_ACCOUNT_ID",
    );
  } finally {
    if (oldToken === undefined) delete process.env.CLOUDFLARE_API_TOKEN;
    else process.env.CLOUDFLARE_API_TOKEN = oldToken;
    if (oldAccount === undefined) delete process.env.CLOUDFLARE_ACCOUNT_ID;
    else process.env.CLOUDFLARE_ACCOUNT_ID = oldAccount;
  }
});

test("user token verification reports unknown status as text", async () => {
  const prior = process.env.CLOUDFLARE_API_TOKEN;
  process.env.CLOUDFLARE_API_TOKEN = "user-token";
  const cf = { get: jest.fn().mockResolvedValue({}) };
  const printer = { log: jest.fn() };
  try {
    await verifyAuthStatus({
      opts: {},
      cf,
      data: { active: null, profiles: {} },
      outputJson: false,
      toJsonOutput: jest.fn(),
      printer,
      fail: jest.fn(),
    });
  } finally {
    if (prior === undefined) delete process.env.CLOUDFLARE_API_TOKEN;
    else process.env.CLOUDFLARE_API_TOKEN = prior;
  }
  expect(cf.get).toHaveBeenCalledWith("/user/tokens/verify");
  expect(printer.log).toHaveBeenCalledWith("unknown");
});
