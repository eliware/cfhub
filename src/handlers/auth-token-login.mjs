import { API_TOKEN_TUTORIAL } from "./auth-prompts.mjs";
import { saveTokenProfile } from "./auth-token-profile-save.mjs";

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
  const interactive = !opts?.["token-stdin"];
  const suppliedToken = opts?.["token-stdin"]
    ? readToken()
    : (printer.error?.(
        `${API_TOKEN_TUTORIAL}\n\nThe token is stored securely and is not displayed.`,
      ),
      await promptToken());
  if (!suppliedToken?.trim()) {
    fail("No API token supplied. Run cfhub auth login again.");
    return;
  }
  const credential = { apiToken: suppliedToken.trim() };
  const detectedAccountToken = credential.apiToken.startsWith("cfat_");
  const accountId =
    opts?.["account-id"] ||
    process.env.CLOUDFLARE_ACCOUNT_ID ||
    (interactive && detectedAccountToken ? await promptAccountId() : undefined);
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
