import { showAccountTokenStatus } from "./auth-status-account-token.mjs";
import { showUserTokenStatus } from "./auth-status-user.mjs";

export async function showAuthStatus(context) {
  const { resource, opts, data, cf, outputJson, toJsonOutput, printer, fail } = context;
  if (!process.env.CLOUDFLARE_API_TOKEN) {
    fail("You are not logged into Cloudflare. Run: cfhub auth login");
    return;
  }
  const statusProfile = process.env.CLOUDFLARE_PROFILE || data.active || "environment";
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (token.startsWith("cfat_")) {
    return showAccountTokenStatus({
      statusProfile,
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
    statusProfile,
    data,
    cf,
    outputJson,
    toJsonOutput,
    printer,
  });
}
