import { jest } from "@jest/globals";
import { verifyAuthStatus } from "../../src/handlers/auth-status-verify.mjs";

test("token verification uses the matching endpoint", async () => {
  const previous = process.env.CLOUDFLARE_API_TOKEN;
  process.env.CLOUDFLARE_API_TOKEN = "cfat_account-token";
  try {
    const cf = { get: jest.fn().mockResolvedValue({ result: { status: "active" } }) };
    const toJsonOutput = jest.fn();
    await verifyAuthStatus({
      token: "cfat_account-token",
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
      token: undefined,
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
  const oldAccount = process.env.CLOUDFLARE_ACCOUNT_ID;
  process.env.CLOUDFLARE_API_TOKEN = "cfat_account-token";
  delete process.env.CLOUDFLARE_ACCOUNT_ID;
  const fail = jest.fn();
  const input = {
    token: "cfat_account-token",
    environmentAccountId: undefined,
    opts: {},
    cf: { get: jest.fn() },
    data: { active: null, profiles: {} },
    outputJson: false,
    toJsonOutput: jest.fn(),
    printer: { log: jest.fn() },
    fail,
  };
  try {
    await verifyAuthStatus(input);
    expect(fail).toHaveBeenCalledWith(
      "Account API token verification requires --account-id or CLOUDFLARE_ACCOUNT_ID",
    );
    const throwingFail = jest.fn((message) => {
      throw new Error(message);
    });
    await expect(verifyAuthStatus({ ...input, fail: throwingFail })).rejects.toThrow(
      "Account API token verification requires --account-id or CLOUDFLARE_ACCOUNT_ID",
    );
    expect(throwingFail).toHaveBeenCalledWith(
      "Account API token verification requires --account-id or CLOUDFLARE_ACCOUNT_ID",
    );
  } finally {
    if (previous === undefined) delete process.env.CLOUDFLARE_API_TOKEN;
    else process.env.CLOUDFLARE_API_TOKEN = previous;
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
      token: "user-token",
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
