import { createAccountTokenStatus } from "../../../../../src/handlers/auth/status/account/view.mjs";

test("builds a status with account details", () => {
  expect(
    createAccountTokenStatus({
      statusProfile: "work",
      accountId: null,
      accounts: { result: [{ id: "account" }] },
    }),
  ).toEqual({
    authenticated: true,
    profile: "work",
    method: "account-api-token",
    accountId: null,
    accounts: [{ id: "account" }],
  });
});

test("omits account lists when the status targets one account", () => {
  expect(
    createAccountTokenStatus({
      statusProfile: "work",
      accountId: "account",
      accounts: { result: [{ id: "ignored" }] },
    }),
  ).toEqual({
    authenticated: true,
    profile: "work",
    method: "account-api-token",
    accountId: "account",
    accounts: undefined,
  });
});

test("uses an empty account list when the API response has no result", () => {
  expect(
    createAccountTokenStatus({ statusProfile: "work", accountId: null, accounts: {} }).accounts,
  ).toEqual([]);
});
