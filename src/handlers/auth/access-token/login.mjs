import { readLoginToken } from "./input.mjs";
import { resolveTokenAccount } from "./account.mjs";
import { reportTokenLogin } from "./login-result.mjs";
import { inspectLoginToken } from "./inspection.mjs";
import { persistApiTokenLogin } from "./persist-login.mjs";

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
  readCredentialImpl,
  deleteCredentialImpl,
  write,
  profileHome,
  profileFs,
  env = process.env,
}) {
  const { interactive, suppliedToken } = await readLoginToken({
    opts,
    readToken,
    promptToken,
    printer,
    fail,
  });
  if (!suppliedToken) return;
  const credential = { apiToken: suppliedToken };
  const { accountId, detectedAccountToken } = await resolveTokenAccount({
    opts,
    interactive,
    token: credential.apiToken,
    promptAccountId,
    env,
  });
  if (detectedAccountToken && !accountId) {
    fail(
      "Missing account ID for this account API token. Set CLOUDFLARE_ACCOUNT_ID or pass --account-id.",
    );
    return;
  }
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
    readCredentialImpl,
    deleteCredentialImpl,
    write,
    profileHome,
    profileFs,
    fail,
    env,
  });
  if (!saved) return;
  return reportTokenLogin({ name, tokenInfo, printer });
}
