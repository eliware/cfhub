export async function verifyAuthStatus({
  opts,
  cf,
  data,
  outputJson,
  toJsonOutput,
  printer,
  fail,
}) {
  if (!process.env.CLOUDFLARE_API_TOKEN) {
    fail("cfhub auth verify requires CLOUDFLARE_API_TOKEN");
    return;
  }
  const statusProfile = process.env.CLOUDFLARE_PROFILE || data.active || "environment";
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const accountId =
    opts?.["account-id"] ||
    data.profiles[statusProfile]?.accountId ||
    process.env.CLOUDFLARE_ACCOUNT_ID;
  if (token.startsWith("cfat_") && !accountId) {
    fail("Account API token verification requires --account-id or CLOUDFLARE_ACCOUNT_ID");
    return;
  }
  const result = await cf.get(
    token.startsWith("cfat_") ? `/accounts/${accountId}/tokens/verify` : "/user/tokens/verify",
  );
  const verified = {
    verified: result?.result?.status === "active",
    status: result?.result?.status || "unknown",
  };
  return outputJson ? toJsonOutput(verified) : printer.log(`${verified.status}`);
}
