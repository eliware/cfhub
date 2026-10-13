import { showAccountTokenStatus } from "./auth-status-account-token.mjs";
import { showUserTokenStatus } from "./auth-status-user.mjs";
import { resolveAuthStatusIdentity } from "./auth-status-identity.mjs";

export async function showAuthStatus(context) {
  const { resource, opts, data, cf, outputJson, toJsonOutput, printer, fail } = context;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const identity = resolveAuthStatusIdentity({ token, resource, data, opts, fail });
  if (!identity) return;
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
