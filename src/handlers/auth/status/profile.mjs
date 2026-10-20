import { showAccountTokenStatus } from "./account/token.mjs";
import { showUserTokenStatus } from "./user.mjs";
import { requireAuthStatusToken, selectAuthStatusIdentity } from "./identity.mjs";

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
    environmentAccountId,
  } = context;
  if (!requireAuthStatusToken(token, fail)) return;
  const identity = selectAuthStatusIdentity({ token, activeProfile, resource, data, opts });
  if (identity.kind === "account") {
    return showAccountTokenStatus({
      statusProfile: identity.profile,
      opts,
      data,
      environmentAccountId,
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
