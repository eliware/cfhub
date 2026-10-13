import { jest } from "@jest/globals";
import { handleAuthStatus } from "../../src/handlers/auth-status.mjs";

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
