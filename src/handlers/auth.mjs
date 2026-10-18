import { handleAuthProfile } from "./auth/profile.mjs";
import { handleAuthStatus } from "./auth/status.mjs";
import { handleAuthLogin } from "./auth/login.mjs";
import { createAuthDependencies } from "./auth/dependencies.mjs";
import { authActionRoute } from "./auth/action-route.mjs";

export async function handleAuth(context = {}) {
  const {
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
    env = process.env,
  } = context;
  const {
    read,
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
  } = createAuthDependencies(context);
  const data = read(profileHome, profileFs);
  const route = authActionRoute(action);
  if (route === "login")
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
    });
  fail(`Unknown auth action: ${action}`);
}
