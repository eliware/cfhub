import { loadOAuthAccountSummary } from "../src/oauth-account-summary.mjs";

test("loads account and summary for the OAuth success page", async () => {
  const fetchImpl = jest
    .fn()
    .mockResolvedValue({ ok: true, json: async () => ({ result: { name: "Acme" } }) });
  const result = await loadOAuthAccountSummary({ accessToken: "a", scopes: [], fetchImpl });
  expect(result.account).toEqual({ name: "Acme" });
  expect(result.page).toContain("Authorization complete");
});

test("tolerates failed and thrown account requests", async () => {
  await expect(
    loadOAuthAccountSummary({
      accessToken: "a",
      scopes: [],
      fetchImpl: jest.fn().mockResolvedValue({ ok: false }),
    }),
  ).resolves.toMatchObject({ account: null });
  await expect(
    loadOAuthAccountSummary({
      accessToken: "a",
      scopes: [],
      fetchImpl: jest.fn().mockRejectedValue(Error("offline")),
    }),
  ).resolves.toMatchObject({ account: null });
});
