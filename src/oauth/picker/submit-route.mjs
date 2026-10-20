import { parseOAuthForm } from "../form.mjs";
import { selectOAuthPickerScopes } from "./scope-selection.mjs";

const plainTextContentType = `text/plain${String.fromCharCode(59)} charset=utf-8`;

export function serveOAuthPickerSubmitRoute({
  request,
  response,
  url,
  scopePicker,
  pickerScopes = [],
  requiredScopes,
  setSelectedScopes,
  makeAuthorization,
  onError = () => {},
}) {
  if (!scopePicker || url.pathname !== "/oauth/start" || request.method !== "POST") return false;
  try {
    const form = parseOAuthForm(request.body ?? "");
    const nextScopes = selectOAuthPickerScopes({
      form,
      requiredScopes,
      preservedScopes: pickerScopes,
    });
    setSelectedScopes(nextScopes);
    response.writeHead(302, {
      location: makeAuthorization(nextScopes, form.get("keep-signed-in") === "on").toString(),
    });
    response.end();
  } catch (error) {
    onError(error);
    const statusCode = error.statusCode || 500;
    response.writeHead(statusCode, { "content-type": plainTextContentType });
    response.end(statusCode === 413 ? "Request body is too large" : "OAuth setup failed");
  }
  return true;
}
