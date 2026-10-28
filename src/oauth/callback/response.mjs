import { renderFailurePage } from "../failure/render.mjs";

const htmlContentType = `text/html${String.fromCharCode(59)} charset=utf-8`;

export function sendOAuthCallbackFailure(response, { title, detail }) {
  response.writeHead(400, { "content-type": htmlContentType });
  response.end(renderFailurePage({ title, detail }));
}

export function callbackStateError(response) {
  sendOAuthCallbackFailure(response, {
    title: "Authorization request expired",
    detail: "This callback does not match the current login request. Start a new login from cfhub.",
  });
  return new Error(
    "OAuth login expired or is open in a different browser. Run `cfhub auth login` with the latest URL.",
  );
}

export function callbackProviderError(response, error, detail) {
  sendOAuthCallbackFailure(response, {
    title: error === "access_denied" ? "Authorization cancelled" : "Authorization failed",
    detail: detail || "The authorization request was not completed.",
  });
  return new Error(`Cloudflare authorization failed: ${error}`);
}

export function callbackCodeError(response) {
  sendOAuthCallbackFailure(response, {
    title: "Authorization code missing",
    detail: "Cloudflare did not return an authorization code. Start a new login from cfhub.",
  });
  return new Error("Cloudflare authorization did not return an authorization code");
}
