import { resolveVerifyAccountId } from "../../../../../src/handlers/auth/status/verify/account.mjs";

test.each([
  ["option", { "account-id": "option" }, { work: { accountId: "saved" } }, "environment", "option"],
  ["saved profile", {}, { work: { accountId: "saved" } }, "environment", "saved"],
  ["environment", {}, {}, "environment", "environment"],
  ["no account ID", {}, {}, undefined, undefined],
])("resolves the %s account ID source", (_name, opts, profiles, environmentAccountId, expected) => {
  expect(
    resolveVerifyAccountId({ opts, data: { profiles }, profile: "work", environmentAccountId }),
  ).toBe(expected);
});
