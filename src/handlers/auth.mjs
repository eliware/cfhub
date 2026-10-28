import { handleAuthProfile } from "./auth/profile.mjs";
import { handleAuthStatus } from "./auth/status.mjs";
import { handleAuthLogin } from "./auth/login.mjs";
import { authActionRoute } from "./auth/action-route.mjs";
import { createAuthContext } from "./auth/context.mjs";

export async function handleAuth(context = {}) {
  const {
    resource,
    cf,
    action,
    opts,
    outputJson,
    printer,
    toJsonOutput,
    fail,
    profileHome,
    profileFs,
    env,
    data,
    write,
    readToken,
    promptToken,
    promptAccountId,
    oauthLogin,
    writeCredentialImpl,
    readCredentialImpl,
    deleteCredentialImpl,
    revokeOAuthImpl,
    inspectApiTokenImpl,
  } = createAuthContext(context);
  const route = authActionRoute(action);
  if (route === "login")
    return handleAuthLogin({
      resource,
      data,
      opts,
      name: opts?.profile || "default",
      oauthLogin,
      writeCredentialImpl,
      readCredentialImpl,
      deleteCredentialImpl,
      readToken,
      promptToken,
      promptAccountId,
      printer,
      fail,
      inspectApiTokenImpl,
      write,
      profileHome,
      profileFs,
      env,
    });
  if (route === "profile")
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
  if (route === "status")
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
      env,
    });
  fail(`Unknown auth action: ${action}`);
}
