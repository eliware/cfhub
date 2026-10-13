import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { VERSION } from "./version.mjs";
import { copyrightYear, REQUIRED_OAUTH_SCOPES } from "./oauth-pages.mjs";
import scopeCatalog from "../data/cloudflare-oauth-scopes.json" with { type: "json" };
import moduleCatalog from "../data/cloudflare-oauth-modules.json" with { type: "json" };

const SCOPE_CATALOG_DATA = scopeCatalog.categories;
const MODULE_CATALOG = moduleCatalog.modules;
export const ALLOWED_OAUTH_SCOPES = new Set(
  Object.values(SCOPE_CATALOG_DATA).flatMap((features) =>
    features.flatMap((feature) => feature.scopes.map((scope) => scope.scope)),
  ),
);
const publicAssets = new Set([
  "oauth-web/cf-logo.svg",
  "oauth-web/cloudflare-115x53.png",
  "oauth-web/eliware-58x58.png",
]);
export const pickerAsset = (name) => {
  const root = publicAssets.has(name) ? "../public/" : "./";
  return readFileSync(fileURLToPath(new URL(`${root}${name}`, import.meta.url)), "utf8");
};
export function sendAsset(
  request,
  response,
  body,
  contentType,
  { cacheControl = "public, max-age=31536000, immutable" } = {},
) {
  const acceptsGzip = /(?:^|,\s*)gzip(?:\s*;|\s*,|\s*$)/i.test(
    request.headers["accept-encoding"] || "",
  );
  const payload = acceptsGzip ? gzipSync(body) : Buffer.from(body);
  const headers = {
    "content-type": contentType,
    "cache-control": cacheControl,
    "content-length": payload.length,
    vary: "Accept-Encoding",
  };
  if (acceptsGzip) headers["content-encoding"] = "gzip";
  response.writeHead(200, headers);
  response.end(payload);
}
export const pickerHtml = () =>
  pickerAsset("oauth-web/oauth-picker.html")
    .replaceAll('href="/oauth-web/cf-logo.svg"', `href="/oauth-web/cf-logo.svg?v=${VERSION}"`)
    .replaceAll('href="/oauth-picker.css"', `href="/oauth-picker.css?v=${VERSION}"`)
    .replaceAll(
      'src="/oauth-web/cloudflare-115x53.png"',
      `src="/oauth-web/cloudflare-115x53.png?v=${VERSION}"`,
    )
    .replaceAll(
      'src="/oauth-web/eliware-58x58.png"',
      `src="/oauth-web/eliware-58x58.png?v=${VERSION}"`,
    )
    .replaceAll('src="/oauth-picker.mjs"', `src="/oauth-picker.mjs?v=${VERSION}"`)
    .replace(
      "__CFHUB_SCOPE_MODEL__",
      JSON.stringify({
        categories: SCOPE_CATALOG_DATA,
        modules: MODULE_CATALOG,
        requiredScopes: REQUIRED_OAUTH_SCOPES,
      }).replace(/</g, "\\u003c"),
    )
    .replaceAll("__COPYRIGHT_YEAR__", copyrightYear())
    .replaceAll("__APP_VERSION__", VERSION);
export function readRequestBody(request) {
  return new Promise((resolve) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => resolve(new URLSearchParams(body)));
  });
}
