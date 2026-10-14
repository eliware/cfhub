import { jest } from "@jest/globals";
import { showAuthStatus } from "../../src/handlers/auth-status-profile.mjs";

test("status stops when credentials are absent", async () => {
  const fail = jest.fn();
  await showAuthStatus({ token: undefined, fail });
  expect(fail).toHaveBeenCalledWith("You are not logged into Cloudflare. Run: cfhub auth login");
});

test("status reports user token identity", async () => {
  const cf = { get: jest.fn().mockResolvedValue({ result: { id: "user", email: "a@b.test" } }) };
  const toJsonOutput = jest.fn();
  await showAuthStatus({
    token: "user-token",
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
});

test("status routes account tokens to account details", async () => {
  const cf = { get: jest.fn().mockResolvedValue({ result: { id: "account" } }) };
  const toJsonOutput = jest.fn();
  await showAuthStatus({
    token: "cfat_token",
    resource: "auth",
    opts: { "account-id": "account" },
    cf,
    data: { active: null, profiles: {} },
    outputJson: true,
    toJsonOutput,
    printer: { log: jest.fn() },
    fail: jest.fn(),
  });
  expect(cf.get).toHaveBeenCalledWith("/accounts/account");
  expect(toJsonOutput).toHaveBeenCalledWith(
    expect.objectContaining({ method: "account-api-token" }),
  );
});
