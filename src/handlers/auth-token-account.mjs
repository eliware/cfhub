export async function resolveTokenAccount({ opts, interactive, token, promptAccountId }) {
  const detectedAccountToken = token.startsWith("cfat_");
  const accountId =
    opts?.["account-id"] ||
    process.env.CLOUDFLARE_ACCOUNT_ID ||
    (interactive && detectedAccountToken ? await promptAccountId() : undefined);
  return { accountId, detectedAccountToken };
}
