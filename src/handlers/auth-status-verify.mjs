import { resolveVerifyAccountId } from "./auth-status-verify-account.mjs";
import { requestTokenVerification } from "./auth-status-verify-request.mjs";

export async function verifyAuthStatus({
  opts,
  cf,
  data,
  outputJson,
  toJsonOutput,
  printer,
  fail,
  token,
  activeProfile,
  environmentAccountId,
}) {
  if (!token) {
    fail("cfhub auth verify requires CLOUDFLARE_API_TOKEN");
    return;
  }
  const statusProfile = activeProfile || data.active || "environment";
  const accountId = resolveVerifyAccountId({
    opts,
    data,
    profile: statusProfile,
    environmentAccountId,
  });
  if (token.startsWith("cfat_") && !accountId) {
    fail("Account API token verification requires --account-id or CLOUDFLARE_ACCOUNT_ID");
    return;
  }
  const verified = await requestTokenVerification({ token, accountId, cf });
  return outputJson ? toJsonOutput(verified) : printer.log(`${verified.status}`);
}
