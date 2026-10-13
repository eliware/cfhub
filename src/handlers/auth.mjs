import { handleAuthProfile } from "./auth-profile.mjs";
import { handleAuthStatus } from "./auth-status.mjs";
import { handleAuthLogin } from "./auth-login.mjs";
import { defaultPromptAccountId, promptHidden } from "./auth-prompts.mjs";
import { readProfiles, writeProfiles } from "../profiles.mjs";
import { deleteCredential, readCredential, writeCredential } from "../credential-store.mjs";
import { fs } from "../fs.mjs";
import { inspectApiToken } from "../token-permissions.mjs";
import { loginOAuth, revokeOAuth } from "../oauth.mjs";
export async function handleAuth({
  resource = "oauth",
  cf,
  action,
  opts,
  outputJson,
  printer = console,
  toJsonOutput,
  fail = () => {},
  profileHome,
  profileFs,
  read = readProfiles,
  write = writeProfiles,
  readToken = () => fs.readFileSync(0, "utf8").trim(),
  promptToken = promptHidden,
  promptAccountId = defaultPromptAccountId,
  oauthLogin = loginOAuth,
  writeCredentialImpl = writeCredential,
  readCredentialImpl = readCredential,
  deleteCredentialImpl = deleteCredential,
  revokeOAuthImpl = revokeOAuth,
  inspectApiTokenImpl = inspectApiToken,
} = {}) {
  const data = read(profileHome, profileFs);
  if (action === "login")
    return handleAuthLogin({
      resource,
      data,
      opts,
      name: opts?.profile || "default",
      oauthLogin,
      writeCredentialImpl,
      readToken,
      promptToken,
      promptAccountId,
      printer,
      fail,
      inspectApiTokenImpl,
      write,
      profileHome,
      profileFs,
    });
  if (["list", "switch", "logout"].includes(action))
    return handleAuthProfile({
      action,
      resource,
      opts,
      data,
      outputJson,
      toJsonOutput,
      printer,
      fail,
      write,
      profileHome,
      profileFs,
      readCredentialImpl,
      revokeOAuthImpl,
      deleteCredentialImpl,
    });
  if (action === "status" || action === "verify")
    return handleAuthStatus({
      action,
      resource,
      opts,
      cf,
      data,
      outputJson,
      toJsonOutput,
      printer,
      fail,
    });
  fail(`Unknown auth action: ${action}`);
}
