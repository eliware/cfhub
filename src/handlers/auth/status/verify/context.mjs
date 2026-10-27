import { resolveAccountTokenId } from "../account/id.mjs";

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
  const accountId = resolveAccountTokenId({
    opts,
    profiles: data.profiles,
    profile,
    environmentAccountId,
  });
  if (token.startsWith("cfat_") && accountId && !/^[A-Za-z0-9_-]+$/.test(accountId)) {
    fail("Account ID contains invalid path characters");
    return null;
  }
  if (token.startsWith("cfat_") && !accountId) {
    fail("Account API token verification requires --account-id or CLOUDFLARE_ACCOUNT_ID");
    return null;
  }
  return { profile, accountId };
}
