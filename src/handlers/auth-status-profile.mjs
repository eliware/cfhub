import { showAccountTokenStatus } from "./auth-status-account-token.mjs";
import { showUserTokenStatus } from "./auth-status-user.mjs";
import { selectAuthStatusIdentity } from "./auth-status-identity.mjs";

export async function showAuthStatus(context) {
  const { resource, opts, data, cf, outputJson, toJsonOutput, printer, fail } = context;
  if (!process.env.CLOUDFLARE_API_TOKEN) {
    fail("You are not logged into Cloudflare. Run: cfhub auth login");
    return;
  }
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const identity = selectAuthStatusIdentity({ token, resource, data, opts });
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
