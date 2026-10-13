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
