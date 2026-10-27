import { resolveAccountTokenId } from "../../../../../src/handlers/auth/status/account/id.mjs";

test.each([
  ["option", { "account-id": "option" }, { work: { accountId: "saved" } }, "environment", "option"],
  ["saved profile", {}, { work: { accountId: "saved" } }, "environment", "saved"],
  ["environment", {}, {}, "environment", "environment"],
  ["no source", {}, {}, undefined, undefined],
])(
  "resolves the %s account ID source",
  (_source, opts, profiles, environmentAccountId, expected) => {
    expect(resolveAccountTokenId({ opts, profiles, profile: "work", environmentAccountId })).toBe(
      expected,
    );
  },
);
