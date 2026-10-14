import { requestTokenVerification } from "./auth-status-verify-request.mjs";
import { outputTokenVerification } from "./auth-status-verify-output.mjs";
import { resolveAuthStatusVerifyContext } from "./auth-status-verify-context.mjs";

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
  const context = resolveAuthStatusVerifyContext({
    token,
    activeProfile,
    data,
    opts,
    environmentAccountId,
    fail,
  });
  if (!context) return;
  const verified = await requestTokenVerification({ token, accountId: context.accountId, cf });
  return outputTokenVerification(verified, { outputJson, toJsonOutput, printer });
}
