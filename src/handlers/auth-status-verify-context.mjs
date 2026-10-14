import { resolveVerifyAccountId } from "./auth-status-verify-account.mjs";

export function resolveAuthStatusVerifyContext({
  token,
  activeProfile,
  data,
  opts,
  environmentAccountId,
  fail,
}) {
  if (!token) {
    fail("cfhub auth verify requires CLOUDFLARE_API_TOKEN");
    return null;
  }
  const profile = activeProfile || data.active || "environment";
  const accountId = resolveVerifyAccountId({ opts, data, profile, environmentAccountId });
  if (token.startsWith("cfat_") && !accountId) {
    fail("Account API token verification requires --account-id or CLOUDFLARE_ACCOUNT_ID");
    return null;
  }
  return { profile, accountId };
}
