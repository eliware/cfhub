import { liveReady, grantedScopes, requiredScopes } from "./cli-live-settings.mjs";

function unavailableCapability(result) {
  return /not enabled|enable .*dashboard|not authorized|authorization failure|no route for that uri|maximum number of lists|invalid_name|provide a zone id|stored certificate|code 1012|health checks disabled/i.test(
    `${result.stdout}\n${result.stderr}`,
  );
}

export function skipUnavailable(label, result) {
  if (!unavailableCapability(result)) return false;
  console.warn(`Skipping ${label}: Cloudflare capability is unavailable.`);
  return true;
}

export function canRun(
  resource,
  action = "list",
  { ready = liveReady, scopes = grantedScopes } = {},
) {
  if (!ready) return false;
  if (!scopes) return true;
  return requiredScopes(resource, action).every((scope) => scopes.includes(scope));
}
