import { readRequestBody } from "./oauth-form.mjs";
import { selectOAuthPickerScopes } from "./oauth-picker-scope-selection.mjs";

export function serveOAuthPickerSubmitRoute({
  request,
  response,
  url,
  scopePicker,
  scopes,
  requiredScopes,
  setSelectedScopes,
  makeAuthorization,
  onError = () => {},
}) {
  if (!scopePicker || url.pathname !== "/oauth/start" || request.method !== "POST") return false;
  readRequestBody(request)
    .then((form) => {
      const nextScopes = selectOAuthPickerScopes({ form, scopes, requiredScopes });
      setSelectedScopes(nextScopes);
      response.writeHead(302, {
        location: makeAuthorization(nextScopes, form.get("keep-signed-in") === "on").toString(),
      });
      response.end();
    })
    .catch((error) => {
      onError(error);
      const statusCode = error.statusCode || 500;
      response.writeHead(statusCode, { "content-type": "text/plain; charset=utf-8" });
      response.end(statusCode === 413 ? "Request body is too large" : "OAuth setup failed");
    });
  return true;
}
