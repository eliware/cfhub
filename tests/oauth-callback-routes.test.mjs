import { jest } from "@jest/globals";
import { routeOAuthCallback } from "../src/oauth-callback-routes.mjs";

const response = () => ({ writeHead: jest.fn(), end: jest.fn() });
const url = (value) => new URL(value, "http://localhost");

test("callback routing rejects other paths and invalid states", () => {
  const missing = response();
  expect(routeOAuthCallback({ url: url("/other"), state: "s", response: missing })).toEqual({
    handled: true,
  });
  expect(missing.writeHead).toHaveBeenCalledWith(404);
  const expired = response();
  expect(
    routeOAuthCallback({ url: url("/oauth/callback?state=x"), state: "s", response: expired }).error
      .message,
  ).toContain("login expired");
});

test("callback routing reports provider errors and accepts valid codes", () => {
  const denied = response();
  expect(
    routeOAuthCallback({
      url: url("/oauth/callback?state=s&error=access_denied"),
      state: "s",
      response: denied,
    }).error.message,
  ).toContain("authorization failed");
  expect(
    routeOAuthCallback({
      url: url("/oauth/callback?state=s&code=c"),
      state: "s",
      response: response(),
    }),
  ).toEqual({ handled: false, code: "c" });
});
