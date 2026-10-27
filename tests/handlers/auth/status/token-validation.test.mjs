import { jest } from "@jest/globals";
import { requireAuthStatusToken } from "../../../../src/handlers/auth/status/token-validation.mjs";

test("accepts and requires an authentication token", () => {
  expect(requireAuthStatusToken("token", jest.fn())).toBe(true);
  const fail = jest.fn();
  expect(requireAuthStatusToken("", fail)).toBe(false);
  expect(fail).toHaveBeenCalledWith("You are not logged into Cloudflare. Run: cfhub auth login");
});
