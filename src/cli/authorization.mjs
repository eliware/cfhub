import { applyActiveProfile } from "../profiles.mjs";
import { missingScopes, missingApiPermissions } from "../scopes.mjs";

export async function authorizeCommand({
  resource,
  action,
  env,
  loadEnv,
  projectRoot,
  homeDir,
  fsImpl,
  printer,
  exit,
  cfFactory,
}) {
  loadEnv(projectRoot, env, fsImpl);
  const managesCredentials =
    (resource === "auth" && ["login", "logout", "list", "switch"].includes(action)) ||
    (resource === "oauth" && (action === "login" || action === "logout"));
  if (!managesCredentials) await applyActiveProfile(env, homeDir, fsImpl);
  const grantedScopes = env.CFHUB_OAUTH_SCOPES?.split(",")
    .map((scope) => scope.trim())
    .filter(Boolean);
  const missing = managesCredentials ? [] : missingScopes(resource, action, grantedScopes);
  if (missing.length) {
    printer.error(
      `Your Cloudflare login is missing scope${missing.length === 1 ? "" : "s"}: ${missing.join(", ")}\n\nRun cfhub auth login again and select the required permissions, or use:\n  cfhub auth login --scopes ${missing.join(",")}`,
    );
    return { allowed: false, result: exit(1) };
  }
  const apiPermissions =
    env.CFHUB_API_PERMISSIONS_KNOWN === "1"
      ? env.CFHUB_API_PERMISSIONS?.split(",")
          .map((permission) => permission.trim())
          .filter(Boolean)
      : null;
  const missingApi = managesCredentials
    ? []
    : missingApiPermissions(resource, action, apiPermissions);
  if (missingApi.length) {
    printer.error(
      `Your active API token is missing permission${missingApi.length === 1 ? "" : "s"}: ${missingApi.join(", ")}\n\nRun cfhub auth login again with a token that grants the required permissions.`,
    );
    return { allowed: false, result: exit(1) };
  }
  return { allowed: true, cf: managesCredentials ? null : cfFactory({ env }) };
}
