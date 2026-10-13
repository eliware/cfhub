import http from "node:http";
import { startOAuthServer } from "./oauth-server.mjs";
import { openBrowser } from "./oauth-browser.mjs";
import { REQUIRED_OAUTH_SCOPES } from "./oauth-page-metadata.mjs";
import { exchangeOAuthCode } from "./oauth-exchange.mjs";
import { DEFAULT_OAUTH_SCOPES } from "./oauth-scopes.mjs";
import { createOAuthAuthorization } from "./oauth-authorization.mjs";
import { launchOAuthBrowser } from "./oauth-browser-launch.mjs";
import { createOAuthCallback } from "./oauth-callback.mjs";
export { collectOAuthSummary } from "./oauth-pages.mjs";
export { copyrightYear, REQUIRED_OAUTH_SCOPES } from "./oauth-page-metadata.mjs";

export { openBrowser } from "./oauth-browser.mjs";
export { DEFAULT_OAUTH_CLIENT_ID, revokeOAuth } from "./oauth-tokens.mjs";
export { refreshOAuth } from "./oauth-refresh.mjs";

export const DEFAULT_OAUTH_PORTS = [8765, 8766, 8767, 8768, 8769];
export { DEFAULT_OAUTH_SCOPES } from "./oauth-scopes.mjs";

export async function loginOAuth({
  clientId,
  scopes = DEFAULT_OAUTH_SCOPES,
  scopePicker = false,
  ports = DEFAULT_OAUTH_PORTS,
  bindHost = "127.0.0.1",
  redirectHost = "127.0.0.1",
  fetchImpl = fetch,
  open = openBrowser,
  print = console.log,
  serverFactory = http.createServer,
  setTimeoutImpl = setTimeout,
}) {
  if (!clientId) throw new Error("Missing CFHUB_OAUTH_CLIENT_ID");
  const { server, port } = await startOAuthServer({ ports, serverFactory, bindHost });
  const redirectUri = `http://${redirectHost}:${port}/oauth/callback`;
  const { verifier, state, makeAuthorization } = createOAuthAuthorization({
    clientId,
    redirectUri,
  });
  print(
    `Open this URL to ${scopePicker ? "set up cfhub" : "authorize cfhub"}: ${scopePicker ? `http://${redirectHost}:${port}/` : makeAuthorization([...new Set([...REQUIRED_OAUTH_SCOPES, ...scopes])])}`,
  );
  const { callback, getSelectedScopes } = createOAuthCallback({
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
    : makeAuthorization(getSelectedScopes()).toString();
  launchOAuthBrowser({ open, browserUrl, print });
  try {
    const { code, response: callbackResponse } = await callback;
    return await exchangeOAuthCode({
      clientId,
      code,
      redirectUri,
      verifier,
      callbackResponse,
      scopes: getSelectedScopes(),
      fetchImpl,
    });
  } finally {
    // Give the browser time to receive the inline result page before the
    // one-shot callback server shuts down.
    setTimeoutImpl(() => server.close(), 250);
  }
}
