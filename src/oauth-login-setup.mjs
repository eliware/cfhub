import { REQUIRED_OAUTH_SCOPES } from "./oauth-page-metadata.mjs";
import { createOAuthAuthorization } from "./oauth-authorization.mjs";
import { createOAuthCallback } from "./oauth-callback.mjs";
import { launchOAuthBrowser } from "./oauth-browser-launch.mjs";

export function prepareOAuthLogin(
  { clientId, redirectHost, port, scopePicker, scopes, server, open, print },
  {
    createAuthorization = createOAuthAuthorization,
    createCallback = createOAuthCallback,
    launchBrowser = launchOAuthBrowser,
  } = {},
) {
  const redirectUri = `http://${redirectHost}:${port}/oauth/callback`;
  const { verifier, state, makeAuthorization } = createAuthorization({ clientId, redirectUri });
  const initialUrl = scopePicker
    ? `http://${redirectHost}:${port}/`
    : makeAuthorization([...new Set([...REQUIRED_OAUTH_SCOPES, ...scopes])]);
  print(`Open this URL to ${scopePicker ? "set up cfhub" : "authorize cfhub"}: ${initialUrl}`);
  const callback = createCallback({
    server,
    redirectUri,
    state,
    scopePicker,
    scopes,
    requiredScopes: REQUIRED_OAUTH_SCOPES,
    makeAuthorization,
  });
  const browserUrl = scopePicker
    ? `http://${redirectHost}:${port}/`
    : makeAuthorization(callback.getSelectedScopes()).toString();
  launchBrowser({ open, browserUrl, print });
  return {
    redirectUri,
    verifier,
    callback: callback.callback,
    getSelectedScopes: callback.getSelectedScopes,
  };
}
