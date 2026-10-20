import { jest } from "@jest/globals";
import { resolveAuthStatusVerifyContext } from "../../../../../src/handlers/auth/status/verify/context.mjs";

const data = { active: "saved", profiles: { saved: { accountId: "profile-account" } } };

test("selects active profile and account ID", () => {
  expect(
    resolveAuthStatusVerifyContext({
      token: "cfat_token",
      activeProfile: null,
      data,
      opts: {},
      environmentAccountId: "environment-account",
      fail: jest.fn(),
    }),
  ).toEqual({ profile: "saved", accountId: "profile-account" });
});

test("reports missing token or account context", () => {
  const fail = jest.fn();
  expect(resolveAuthStatusVerifyContext({ token: null, data, opts: {}, fail })).toBeNull();
  expect(fail).toHaveBeenCalledWith("cfhub auth verify requires CLOUDFLARE_API_TOKEN");
  expect(
    resolveAuthStatusVerifyContext({
      token: "cfat_token",
      data: { profiles: {} },
      opts: {},
      fail,
    }),
  ).toBeNull();
  expect(fail).toHaveBeenLastCalledWith(
    "Account API token verification requires --account-id or CLOUDFLARE_ACCOUNT_ID",
  );
});

test("rejects account IDs that contain path separators", () => {
  const fail = jest.fn();
  expect(
    resolveAuthStatusVerifyContext({
      token: "cfat_token",
      data: { profiles: {} },
      opts: { "account-id": "../user" },
      fail,
    }),
  ).toBeNull();
  expect(fail).toHaveBeenCalledWith("Account ID contains invalid path characters");
});

test("rejects a dot-only account ID", () => {
  const fail = jest.fn();
  expect(
    resolveAuthStatusVerifyContext({
      token: "cfat_token",
      data: { profiles: {} },
      opts: { "account-id": ".." },
      fail,
    }),
  ).toBeNull();
  expect(fail).toHaveBeenCalledWith("Account ID contains invalid path characters");
});
