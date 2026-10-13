import { jest } from "@jest/globals";
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

test("status routes to the profile status helper", async () => {
  process.env.CLOUDFLARE_API_TOKEN = "user-token";
  const cf = { get: jest.fn().mockResolvedValue({ result: { id: "user-1" } }) };
  const toJsonOutput = jest.fn();
  await handleAuthStatus(authStatusContext({ resource: "oauth", cf, toJsonOutput }));
  expect(cf.get).toHaveBeenCalledWith("/user");
  expect(toJsonOutput).toHaveBeenCalledWith(expect.objectContaining({ authenticated: true }));
});

test("verify routes to the token verification helper", async () => {
  process.env.CLOUDFLARE_API_TOKEN = "user-token";
  const cf = { get: jest.fn().mockResolvedValue({ result: { status: "active" } }) };
  const toJsonOutput = jest.fn();
  await handleAuthStatus(authStatusContext({ action: "verify", cf, toJsonOutput }));
  expect(cf.get).toHaveBeenCalledWith("/user/tokens/verify");
  expect(toJsonOutput).toHaveBeenCalledWith({ verified: true, status: "active" });
});

test("status helper ignores unknown actions", async () => {
  const cf = { get: jest.fn() };
  await handleAuthStatus(authStatusContext({ action: "unknown", cf }));
  expect(cf.get).not.toHaveBeenCalled();
});
