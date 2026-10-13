import { jest } from "@jest/globals";
import { showAuthStatus } from "../../src/handlers/auth-status-profile.mjs";

test("status stops when credentials are absent", async () => {
  const prior = process.env.CLOUDFLARE_API_TOKEN;
  delete process.env.CLOUDFLARE_API_TOKEN;
  const fail = jest.fn();
  try {
    await showAuthStatus({ fail });
  } finally {
    if (prior === undefined) delete process.env.CLOUDFLARE_API_TOKEN;
    else process.env.CLOUDFLARE_API_TOKEN = prior;
  }
  expect(fail).toHaveBeenCalledWith("You are not logged into Cloudflare. Run: cfhub auth login");
});

test("status reports user token identity", async () => {
  const previous = process.env.CLOUDFLARE_API_TOKEN;
  process.env.CLOUDFLARE_API_TOKEN = "user-token";
  try {
    const cf = { get: jest.fn().mockResolvedValue({ result: { id: "user", email: "a@b.test" } }) };
    const toJsonOutput = jest.fn();
    await showAuthStatus({
      resource: "oauth",
      opts: {},
      cf,
      data: { active: null, profiles: {} },
      outputJson: true,
      toJsonOutput,
      printer: { log: jest.fn() },
      fail: jest.fn(),
    });
    expect(cf.get).toHaveBeenCalledWith("/user");
    expect(toJsonOutput).toHaveBeenCalledWith(
      expect.objectContaining({ method: "oauth", id: "user" }),
    );
  } finally {
    if (previous === undefined) delete process.env.CLOUDFLARE_API_TOKEN;
    else process.env.CLOUDFLARE_API_TOKEN = previous;
  }
});

test("status routes account tokens to account details", async () => {
  const prior = process.env.CLOUDFLARE_API_TOKEN;
  process.env.CLOUDFLARE_API_TOKEN = "cfat_token";
  const cf = { get: jest.fn().mockResolvedValue({ result: { id: "account" } }) };
  const toJsonOutput = jest.fn();
  try {
    await showAuthStatus({
      resource: "auth",
      opts: { "account-id": "account" },
      cf,
      data: { active: null, profiles: {} },
      outputJson: true,
      toJsonOutput,
      printer: { log: jest.fn() },
      fail: jest.fn(),
    });
  } finally {
    if (prior === undefined) delete process.env.CLOUDFLARE_API_TOKEN;
    else process.env.CLOUDFLARE_API_TOKEN = prior;
  }
  expect(cf.get).toHaveBeenCalledWith("/accounts/account");
  expect(toJsonOutput).toHaveBeenCalledWith(
    expect.objectContaining({ method: "account-api-token" }),
  );
});
