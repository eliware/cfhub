import { jest } from "@jest/globals";
import { showAuthStatus } from "../../src/handlers/auth-status-profile.mjs";

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
