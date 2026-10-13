import { saveTokenProfile } from "./auth-token-profile-save.mjs";
import { readLoginToken, resolveTokenAccount } from "./auth-token-input.mjs";

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
  let tokenInfo;
  try {
    tokenInfo = await inspectApiTokenImpl({ token: credential.apiToken, accountId });
  } catch (error) {
    fail(`Could not verify API token: ${error.message}`);
    return;
  }
  const storedInKeychain = await writeCredentialImpl(name, credential);
  if (!storedInKeychain) {
    fail("Could not save the API token to the OS keychain or private credential file");
    return;
  }
  saveTokenProfile({
    data,
    name,
    opts,
    tokenInfo,
    detectedAccountToken,
    accountId,
    write,
    profileHome,
    profileFs,
  });
  const summary = tokenInfo.permissionSummary;
  const discovered = tokenInfo.permissionsKnown
    ? `\nPermissions discovered: ${summary.total} (Read: ${summary.read}, Write/Edit: ${summary.write}, Other: ${summary.other})`
    : "";
  return printer.log(`Saved and activated profile ${name}${discovered}`);
}
