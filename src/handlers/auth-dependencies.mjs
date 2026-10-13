import { readProfiles, writeProfiles } from "../profiles.mjs";
import { deleteCredential, readCredential, writeCredential } from "../credential-store.mjs";
import { fs } from "../fs.mjs";
import { inspectApiToken } from "../token-permissions.mjs";
import { loginOAuth, revokeOAuth } from "../oauth.mjs";
import { defaultPromptAccountId, promptHidden } from "./auth-prompts.mjs";

export function createAuthDependencies(overrides = {}) {
  return {
    read: overrides.read || readProfiles,
    write: overrides.write || writeProfiles,
    readToken: overrides.readToken || (() => fs.readFileSync(0, "utf8").trim()),
    promptToken: overrides.promptToken || promptHidden,
    promptAccountId: overrides.promptAccountId || defaultPromptAccountId,
    oauthLogin: overrides.oauthLogin || loginOAuth,
    writeCredentialImpl: overrides.writeCredentialImpl || writeCredential,
    readCredentialImpl: overrides.readCredentialImpl || readCredential,
    deleteCredentialImpl: overrides.deleteCredentialImpl || deleteCredential,
    revokeOAuthImpl: overrides.revokeOAuthImpl || revokeOAuth,
    inspectApiTokenImpl: overrides.inspectApiTokenImpl || inspectApiToken,
  };
}
