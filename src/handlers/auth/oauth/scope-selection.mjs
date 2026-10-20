export function selectOAuthScopes(opts = {}, env = {}, defaultScopes = []) {
  const configuredScopes = (env.CFHUB_OAUTH_SCOPES || "")
    .split(",")
    .map((scope) => scope.trim())
    .filter(Boolean);
  const requestedScopes = []
    .concat(opts.scopes || [], opts.scope || [])
    .flatMap((value) => String(value).split(","))
    .map((scope) => scope.trim())
    .filter(Boolean);
  return {
    scopes: [...new Set([...defaultScopes, ...configuredScopes, ...requestedScopes])],
    pickerScopes: [...new Set([...configuredScopes, ...requestedScopes])],
  };
}
