import { jest } from "@jest/globals";
import { requireAuthStatusToken } from "../../../../src/handlers/auth/status/token-required.mjs";

test("accepts a token", () => {
  expect(requireAuthStatusToken("token", jest.fn())).toBe(true);
});

test("reports when a token is missing", () => {
  const fail = jest.fn();
  expect(requireAuthStatusToken("", fail)).toBe(false);
  expect(fail).toHaveBeenCalledWith("You are not logged into Cloudflare. Run: cfhub auth login");
});
