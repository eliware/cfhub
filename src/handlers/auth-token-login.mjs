import { readLoginToken } from "./auth-token-input.mjs";
import { resolveTokenAccount } from "./auth-token-account.mjs";
import { reportTokenLogin } from "./auth-token-login-result.mjs";
import { inspectLoginToken } from "./auth-token-inspection.mjs";
import { persistApiTokenLogin } from "./auth-token-persist-login.mjs";

export async function saveApiTokenLogin({
  data,
  opts,
  name,
  readToken,
  promptToken,
  promptAccountId,
  printer,
  fail,
  inspectApiTokenImpl,
  writeCredentialImpl,
  write,
  profileHome,
  profileFs,
}) {
  const { interactive, suppliedToken } = await readLoginToken({
    opts,
    readToken,
    promptToken,
    printer,
  });
  if (!suppliedToken?.trim()) {
    fail("No API token supplied. Run cfhub auth login again.");
    return;
  }
  const credential = { apiToken: suppliedToken.trim() };
  const { accountId, detectedAccountToken } = await resolveTokenAccount({
    opts,
    interactive,
    token: credential.apiToken,
    promptAccountId,
  });
  const tokenInfo = await inspectLoginToken({
    token: credential.apiToken,
    accountId,
    inspectApiTokenImpl,
    fail,
  });
  if (!tokenInfo) return;
  const saved = await persistApiTokenLogin({
    data,
    name,
    credential,
    opts,
    tokenInfo,
    detectedAccountToken,
    accountId,
    writeCredentialImpl,
    write,
    profileHome,
    profileFs,
    fail,
  });
  if (!saved) return;
  return reportTokenLogin({ name, tokenInfo, printer });
}
