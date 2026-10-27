import { jest } from "@jest/globals";
import { handleAuthStatus } from "../../../src/handlers/auth/status.mjs";
import { authStatusContext } from "../../../test-fixtures/auth-status-context.mjs";

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

test("status uses explicit identity values from its caller", async () => {
  process.env.CLOUDFLARE_API_TOKEN = "cfat-environment-token";
  process.env.CLOUDFLARE_PROFILE = "environment-profile";
  const cf = { get: jest.fn().mockResolvedValue({ result: { id: "user-1" } }) };
  const toJsonOutput = jest.fn();
  await handleAuthStatus(
    authStatusContext({
      token: "user-token",
      activeProfile: "caller-profile",
      environmentAccountId: "caller-account",
      resource: "oauth",
      cf,
      toJsonOutput,
    }),
  );
  expect(toJsonOutput).toHaveBeenCalledWith(expect.objectContaining({ profile: "caller-profile" }));
});

test("status helper ignores unknown actions", async () => {
  const cf = { get: jest.fn() };
  await handleAuthStatus(authStatusContext({ action: "unknown", cf }));
  expect(cf.get).not.toHaveBeenCalled();
});
