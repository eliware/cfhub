import http from "node:http";
import { startOAuthServer } from "./oauth/server.mjs";
import { openBrowser } from "./oauth/browser.mjs";
import { exchangeOAuthCode } from "./oauth/exchange.mjs";
import { DEFAULT_OAUTH_SCOPES } from "./oauth/scopes.mjs";
import { prepareOAuthLogin } from "./oauth/login-setup.mjs";
import { DEFAULT_OAUTH_PORTS } from "./oauth/api.mjs";

export async function loginOAuth({
  clientId,
  scopes = DEFAULT_OAUTH_SCOPES,
  scopePicker = false,
  pickerScopes = [],
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
  const setup = prepareOAuthLogin({
    clientId,
    redirectHost,
    port,
    scopePicker,
    scopes,
    pickerScopes,
    server,
    open,
    print,
  });
  try {
    const { code, response: callbackResponse } = await setup.callback;
    return await exchangeOAuthCode({
      clientId,
      code,
      redirectUri: setup.redirectUri,
      verifier: setup.verifier,
      callbackResponse,
      scopes: setup.getSelectedScopes(),
      fetchImpl,
    });
  } finally {
    // Give the browser time to receive the inline result page before the
    // one-shot callback server shuts down.
    setTimeoutImpl(() => server.close(), 250);
  }
}
