import { ALLOWED_OAUTH_SCOPES } from "./oauth-scope-model.mjs";
import { readRequestBody } from "./oauth-form.mjs";

export function serveOAuthPickerSubmitRoute({
  request,
  response,
  url,
  scopePicker,
  scopes,
  requiredScopes,
  setSelectedScopes,
  makeAuthorization,
}) {
  if (!scopePicker || url.pathname !== "/oauth/start" || request.method !== "POST") return false;
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
