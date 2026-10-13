import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { VERSION } from "./version.mjs";
import { pickerAsset, pickerHtml, readRequestBody, sendAsset } from "./oauth-picker-assets.mjs";
import { ALLOWED_OAUTH_SCOPES } from "./oauth-scope-model.mjs";

export function serveOAuthPickerRoute({
  request,
  response,
  url,
  scopePicker,
  scopes,
  requiredScopes,
  setSelectedScopes,
  makeAuthorization,
}) {
  if (scopePicker && url.pathname === "/" && request.method === "GET") {
    sendAsset(request, response, pickerHtml(), "text/html; charset=utf-8", {
      cacheControl: "no-store",
    });
    return true;
  }
  if (url.pathname === "/api/version" && request.method === "GET") {
    const project = url.searchParams.get("project");
    if (project !== "cfhub") {
      response.writeHead(404, { "content-type": "application/json; charset=utf-8" });
      response.end(JSON.stringify({ error: `Project not found: ${project || ""}` }) + "\n");
      return true;
    }
    response.writeHead(200, { "content-type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ name: "cfhub", version: VERSION }) + "\n");
    return true;
  }
  const assets = {
    "/oauth-picker.css": ["oauth-web/bundled/oauth-picker.css", "text/css; charset=utf-8"],
    "/oauth-picker.mjs": ["oauth-web/oauth-picker.mjs", "text/javascript; charset=utf-8"],
    "/picker-groups.mjs": ["oauth-web/picker-groups.mjs", "text/javascript; charset=utf-8"],
    "/picker-events.mjs": ["oauth-web/picker-events.mjs", "text/javascript; charset=utf-8"],
    "/picker-state.mjs": ["oauth-web/picker-state.mjs", "text/javascript; charset=utf-8"],
    "/picker-navigation.mjs": ["oauth-web/picker-navigation.mjs", "text/javascript; charset=utf-8"],
    "/oauth-web/cf-logo.svg": ["oauth-web/cf-logo.svg", "image/svg+xml"],
    "/oauth-result.css": ["oauth-web/bundled/oauth-result.css", "text/css; charset=utf-8"],
  };
  if (scopePicker && request.method === "GET" && assets[url.pathname]) {
    const [asset, type] = assets[url.pathname];
    sendAsset(request, response, pickerAsset(asset), type);
    return true;
  }
  const images = {
    "/oauth-web/cloudflare-115x53.png": "cloudflare-115x53.png",
    "/oauth-web/eliware-58x58.png": "eliware-58x58.png",
  };
  if (scopePicker && request.method === "GET" && images[url.pathname]) {
    const path = `../public/oauth-web/${images[url.pathname]}`;
    sendAsset(
      request,
      response,
      readFileSync(fileURLToPath(new URL(path, import.meta.url))),
      "image/png",
    );
    return true;
  }
  if (scopePicker && url.pathname === "/oauth/start" && request.method === "POST") {
    readRequestBody(request).then((form) => {
      const requested = form.getAll("scope").filter((scope) => ALLOWED_OAUTH_SCOPES.has(scope));
      const nextScopes = [
        ...new Set([...requiredScopes, ...(requested.length ? requested : scopes)]),
      ];
      setSelectedScopes(nextScopes);
      response.writeHead(302, {
        location: makeAuthorization(nextScopes, form.get("keep-signed-in") === "on").toString(),
      });
      response.end();
    });
    return true;
  }
  return false;
}
