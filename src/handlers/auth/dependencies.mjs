import process from "node:process";
import { readProfiles, writeProfiles } from "../../profiles.mjs";
import { deleteCredential, readCredential, writeCredential } from "../../identity/store.mjs";
import { inspectApiToken } from "../../token-permissions.mjs";
import { loginOAuth } from "../../oauth.mjs";
import { revokeOAuth } from "../../oauth/api.mjs";
import { defaultPromptAccountId } from "./prompts.mjs";
import { promptHidden } from "./access-token/prompt.mjs";
import { readHiddenStreamInput } from "./access-token/stream-reader.mjs";

export function createAuthDependencies(overrides = {}) {
  return {
    read: overrides.read || readProfiles,
    write: overrides.write || writeProfiles,
    readToken: overrides.readToken || (() => readHiddenStreamInput(process.stdin)),
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
