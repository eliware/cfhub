import { resolveAccountTokenId } from "../../../../../src/handlers/auth/status/account/id.mjs";

test("resolves account ID from options, saved profiles, or environment", () => {
  const profiles = { work: { accountId: "saved" } };
  expect(
    resolveAccountTokenId({
      opts: { "account-id": "option" },
      profiles,
      profile: "work",
      environmentAccountId: "environment",
    }),
  ).toBe("option");
  expect(
    resolveAccountTokenId({ profiles, profile: "work", environmentAccountId: "environment" }),
  ).toBe("saved");
  expect(resolveAccountTokenId({ profiles: {}, profile: "work" })).toBeUndefined();
  expect(
    resolveAccountTokenId({ profiles: {}, profile: "work", environmentAccountId: "environment" }),
  ).toBe("environment");
});
