import crypto from "node:crypto";
import http from "node:http";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { VERSION } from "./version.mjs";
import { openBrowser } from "./oauth-browser.mjs";
import { collectOAuthSummary, REQUIRED_OAUTH_SCOPES } from "./oauth-pages.mjs";
import {
  ALLOWED_OAUTH_SCOPES,
  pickerAsset,
  pickerHtml,
  readRequestBody,
  sendAsset,
} from "./oauth-picker-assets.mjs";
import { failurePage, successPage } from "./oauth-result-pages.mjs";
export { collectOAuthSummary, copyrightYear, REQUIRED_OAUTH_SCOPES } from "./oauth-pages.mjs";

export { openBrowser } from "./oauth-browser.mjs";
export { DEFAULT_OAUTH_CLIENT_ID, refreshOAuth, revokeOAuth } from "./oauth-tokens.mjs";

export const DEFAULT_OAUTH_PORTS = [8765, 8766, 8767, 8768, 8769];
export const DEFAULT_OAUTH_SCOPES = [
  "account-settings.read",
  "user-details.read",
  "zone.read",
  "zone.write",
  "zone-settings.read",
  "zone-settings.write",
  "dns.read",
  "dns.write",
  "account-rulesets.read",
  "account-rulesets.write",
  "account-rule-lists.read",
  "account-rule-lists.write",
  "zone-waf.read",
  "zone-waf.write",
  "ssl-and-certificates.read",
  "ssl-and-certificates.write",
  "cache.purge",
  "healthcheck.read",
  "healthcheck.write",
  "account-logs.read",
  "load-balancing-monitors-and-pools.read",
  "load-balancing-monitors-and-pools.write",
  "argotunnel.read",
  "argotunnel.write",
  "workers-scripts.read",
  "workers-scripts.write",
  "workers-scripts.bind",
  "page.read",
  "page.write",
  "workers-r2.read",
  "workers-r2.write",
  "d1.read",
  "d1.write",
  "queues.read",
  "queues.write",
  "stream.read",
  "stream.write",
  "images.read",
  "images.write",
  "ai.read",
  "ai.write",
  "access.read",
  "access.write",
];
const AUTH_URL = "https://dash.cloudflare.com/oauth2/auth";
const TOKEN_URL = "https://dash.cloudflare.com/oauth2/token";
const USER_URL = "https://api.cloudflare.com/client/v4/user";

function base64url(value) {
  return value.toString("base64url");
}
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
}) {
  if (!clientId) throw new Error("Missing CFHUB_OAUTH_CLIENT_ID");
  const verifier = base64url(crypto.randomBytes(32));
  const challenge = base64url(crypto.createHash("sha256").update(verifier).digest());
  const state = base64url(crypto.randomBytes(24));
  let server;
  let port;
  for (const candidate of ports) {
    try {
      server = serverFactory();
      await /** @type {Promise<void>} */ (
        new Promise((resolve, reject) => {
          const onError = (error) => {
            server.removeListener("listening", onListen);
            reject(error);
          };
          const onListen = () => {
            server.removeListener("error", onError);
            resolve();
          };
          server.once("error", onError);
          server.once("listening", onListen);
          server.listen(candidate, bindHost);
        })
      );
      port = server.address()?.port || candidate;
      break;
    } catch (error) {
      if (server) server.close();
      if (error.code !== "EADDRINUSE") throw error;
    }
  }
  if (!server || !port) throw new Error("No OAuth callback port available (tried 8765-8769)");
  const redirectUri = `http://${redirectHost}:${port}/oauth/callback`;
  const makeAuthorization = (selected, offlineAccess = false) => {
    const authorization = new URL(AUTH_URL);
    const authorizationScopes = offlineAccess ? [...selected, "offline_access"] : selected;
    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: authorizationScopes.join(" "),
      code_challenge: challenge,
      code_challenge_method: "S256",
      state,
    });
    for (const [key, value] of params) authorization.searchParams.set(key, value);
    return authorization;
  };
  let selectedScopes = [...new Set([...REQUIRED_OAUTH_SCOPES, ...scopes])];
  print(
    `Open this URL to ${scopePicker ? "set up cfhub" : "authorize cfhub"}: ${scopePicker ? `http://${redirectHost}:${port}/` : makeAuthorization(selectedScopes)}`,
  );
  const callback = new Promise((resolve, reject) =>
    server.on("request", (request, response) => {
      const url = new URL(request.url, redirectUri);
      if (scopePicker && url.pathname === "/" && request.method === "GET") {
        sendAsset(request, response, pickerHtml(), "text/html; charset=utf-8", {
          cacheControl: "no-store",
        });
        return;
      }
      if (url.pathname === "/api/version" && request.method === "GET") {
        const project = url.searchParams.get("project");
        if (project !== "cfhub") {
          response.writeHead(404, { "content-type": "application/json; charset=utf-8" });
          response.end(JSON.stringify({ error: `Project not found: ${project || ""}` }) + "\n");
          return;
        }
        response.writeHead(200, { "content-type": "application/json; charset=utf-8" });
        response.end(JSON.stringify({ name: "cfhub", version: VERSION }) + "\n");
        return;
      }
      if (scopePicker && url.pathname === "/oauth-picker.css" && request.method === "GET") {
        sendAsset(
          request,
          response,
          pickerAsset("oauth-web/bundled/oauth-picker.css"),
          "text/css; charset=utf-8",
        );
        return;
      }
      if (scopePicker && url.pathname === "/oauth-picker.mjs" && request.method === "GET") {
        sendAsset(
          request,
          response,
          pickerAsset("oauth-web/oauth-picker.mjs"),
          "text/javascript; charset=utf-8",
        );
        return;
      }
      if (scopePicker && url.pathname === "/oauth-web/cf-logo.svg" && request.method === "GET") {
        sendAsset(request, response, pickerAsset("oauth-web/cf-logo.svg"), "image/svg+xml");
        return;
      }
      if (
        scopePicker &&
        url.pathname === "/oauth-web/cloudflare-115x53.png" &&
        request.method === "GET"
      ) {
        sendAsset(
          request,
          response,
          readFileSync(
            fileURLToPath(new URL("../public/oauth-web/cloudflare-115x53.png", import.meta.url)),
          ),
          "image/png",
        );
        return;
      }
      if (
        scopePicker &&
        url.pathname === "/oauth-web/eliware-58x58.png" &&
        request.method === "GET"
      ) {
        sendAsset(
          request,
          response,
          readFileSync(
            fileURLToPath(new URL("../public/oauth-web/eliware-58x58.png", import.meta.url)),
          ),
          "image/png",
        );
        return;
      }
      if (scopePicker && url.pathname === "/oauth-result.css" && request.method === "GET") {
        sendAsset(
          request,
          response,
          pickerAsset("oauth-web/bundled/oauth-result.css"),
          "text/css; charset=utf-8",
        );
        return;
      }
      if (scopePicker && url.pathname === "/oauth/start" && request.method === "POST") {
        readRequestBody(request).then((form) => {
          const requested = form.getAll("scope").filter((scope) => ALLOWED_OAUTH_SCOPES.has(scope));
          selectedScopes = [
            ...new Set([...REQUIRED_OAUTH_SCOPES, ...(requested.length ? requested : scopes)]),
          ];
          response.writeHead(302, {
            location: makeAuthorization(
              selectedScopes,
              form.get("keep-signed-in") === "on",
            ).toString(),
          });
          response.end();
        });
        return;
      }
      if (url.pathname !== "/oauth/callback") {
        response.writeHead(404);
        response.end();
        return;
      }
      if (url.searchParams.get("state") !== state) {
        response.writeHead(400, { "content-type": "text/html; charset=utf-8" });
        response.end(
          failurePage({
            title: "Authorization request expired",
            detail:
              "This callback no longer matches the login request. Start a new login from the cfhub command line and try again.",
          }),
        );
        reject(
          new Error(
            "OAuth login expired or was opened in another browser. Run `cfhub auth login` again using the newest URL.",
          ),
        );
        return;
      }
      const error = url.searchParams.get("error");
      if (error) {
        const description =
          url.searchParams.get("error_description") ||
          "The authorization request was not completed.";
        response.writeHead(400, { "content-type": "text/html; charset=utf-8" });
        response.end(
          failurePage({
            title: error === "access_denied" ? "Authorization cancelled" : "Authorization failed",
            detail: description,
          }),
        );
        reject(new Error(`Cloudflare authorization failed: ${error}`));
        return;
      }
      resolve({ code: url.searchParams.get("code"), response });
    }),
  );
  const browserUrl = scopePicker
    ? `http://${redirectHost}:${port}/`
    : makeAuthorization(selectedScopes).toString();
  try {
    const browser = open(browserUrl);
    browser?.once?.("error", (error) => {
      print(
        `Could not open a browser automatically (${error.code || error.message}). Copy the URL above into a browser.`,
      );
    });
  } catch (error) {
    print(
      `Could not open a browser automatically (${error.code || error.message}). Copy the URL above into a browser.`,
    );
  }
  try {
    const { code, response: callbackResponse } = await callback;
    try {
      const response = await fetchImpl(TOKEN_URL, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: clientId,
          code,
          redirect_uri: redirectUri,
          code_verifier: verifier,
        }),
      });
      if (!response.ok) throw new Error(`OAuth token exchange failed (${response.status})`);
      const tokens = await response.json();
      if (!tokens.access_token)
        throw new Error("OAuth token response did not include access_token");
      let account = null;
      try {
        const accountResponse = await fetchImpl(USER_URL, {
          headers: { authorization: `Bearer ${tokens.access_token}` },
        });
        if (accountResponse.ok) account = (await accountResponse.json())?.result;
      } catch {
        /* account confirmation is best effort */
      }
      const summary = await collectOAuthSummary({
        accessToken: tokens.access_token,
        account,
        scopes: selectedScopes,
        fetchImpl,
      });
      callbackResponse.writeHead(200, {
        "content-type": "text/html; charset=utf-8",
      });
      callbackResponse.end(successPage({ account, scopes: selectedScopes, summary }));
      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresIn: tokens.expires_in,
        expiresAt: Date.now() + (tokens.expires_in || 3600) * 1000,
        scopes: selectedScopes,
        account,
      };
    } catch (error) {
      callbackResponse.writeHead(400, {
        "content-type": "text/html; charset=utf-8",
      });
      callbackResponse.end(
        "<!doctype html><title>cfhub authorization failed</title><p>Cloudflare authorization could not be completed. You may close this window and try again.</p>",
      );
      throw error;
    }
  } finally {
    // Give the browser time to receive the inline result page before the
    // one-shot callback server shuts down.
    setTimeout(() => server.close(), 250);
  }
}
