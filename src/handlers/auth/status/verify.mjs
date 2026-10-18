import { requestTokenVerification } from "./verify/request.mjs";
import { outputTokenVerification } from "./verify/output.mjs";
import { resolveAuthStatusVerifyContext } from "./verify/context.mjs";

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
