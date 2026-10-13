import { resolveTokenAccount } from "../../src/handlers/auth-token-account.mjs";

test("resolves option, environment, and prompted account IDs", async () => {
  const prior = process.env.CLOUDFLARE_ACCOUNT_ID;
  process.env.CLOUDFLARE_ACCOUNT_ID = "environment";
  try {
    await expect(
      resolveTokenAccount({
        opts: { "account-id": "option" },
        interactive: true,
        token: "cfat_account",
        promptAccountId: async () => "prompt",
      }),
    ).resolves.toEqual({ accountId: "option", detectedAccountToken: true });
    await expect(
      resolveTokenAccount({
        opts: {},
        interactive: true,
        token: "cfat_account",
        promptAccountId: async () => "prompt",
      }),
    ).resolves.toEqual({ accountId: "environment", detectedAccountToken: true });
  } finally {
    if (prior === undefined) delete process.env.CLOUDFLARE_ACCOUNT_ID;
    else process.env.CLOUDFLARE_ACCOUNT_ID = prior;
  }
  await expect(
    resolveTokenAccount({
      opts: {},
      interactive: true,
      token: "cfat_account",
      promptAccountId: async () => "prompt",
    }),
  ).resolves.toEqual({ accountId: "prompt", detectedAccountToken: true });
  await expect(
    resolveTokenAccount({
      opts: {},
      interactive: false,
      token: "cfat_account",
      promptAccountId: async () => "unused",
    }),
  ).resolves.toEqual({ accountId: undefined, detectedAccountToken: true });
  await expect(
    resolveTokenAccount({
      opts: {},
      interactive: true,
      token: "user-token",
      promptAccountId: async () => "unused",
    }),
  ).resolves.toEqual({ accountId: undefined, detectedAccountToken: false });
});
