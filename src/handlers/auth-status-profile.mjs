import { showAccountTokenStatus } from "./auth-status-account-token.mjs";
import { showUserTokenStatus } from "./auth-status-user.mjs";
import { selectAuthStatusIdentity } from "./auth-status-identity.mjs";
import { requireAuthStatusToken } from "./auth-status-token-required.mjs";

export async function showAuthStatus(context) {
  const {
    resource,
    opts,
    data,
    cf,
    outputJson,
    toJsonOutput,
    printer,
    fail,
    token,
    activeProfile,
  } = context;
  if (!requireAuthStatusToken(token, fail)) return;
  const identity = selectAuthStatusIdentity({ token, activeProfile, resource, data, opts });
  if (identity.kind === "account") {
    return showAccountTokenStatus({
      statusProfile: identity.profile,
      opts,
      data,
      cf,
      outputJson,
      toJsonOutput,
      printer,
    });
  }
  return showUserTokenStatus({
    resource,
    statusProfile: identity.profile,
    data,
    cf,
    outputJson,
    toJsonOutput,
    printer,
  });
}
