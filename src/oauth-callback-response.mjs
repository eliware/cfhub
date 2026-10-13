import { failurePage } from "./oauth-failure-page.mjs";

export function sendOAuthCallbackFailure(response, { title, detail }) {
  response.writeHead(400, { "content-type": "text/html; charset=utf-8" });
  response.end(failurePage({ title, detail }));
}

export function callbackStateError(response) {
  sendOAuthCallbackFailure(response, {
    title: "Authorization request expired",
    detail:
      "This callback no longer matches the login request. Start a new login from the cfhub command line and try again.",
  });
  return new Error(
    "OAuth login expired or was opened in another browser. Run `cfhub auth login` again using the newest URL.",
  );
}

export function callbackProviderError(response, error, detail) {
  sendOAuthCallbackFailure(response, {
    title: error === "access_denied" ? "Authorization cancelled" : "Authorization failed",
    detail: detail || "The authorization request was not completed.",
  });
  return new Error(`Cloudflare authorization failed: ${error}`);
}
