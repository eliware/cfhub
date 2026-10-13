import { callbackProviderError, callbackStateError } from "./oauth-callback-response.mjs";
import { serveOAuthPickerRoute } from "./oauth-picker-routes.mjs";

export function createOAuthCallback({
  server,
  redirectUri,
  state,
  scopePicker,
  scopes,
  requiredScopes,
  makeAuthorization,
}) {
  let selectedScopes = [...new Set([...requiredScopes, ...scopes])];
  const callback = new Promise((resolve, reject) =>
    server.on("request", (request, response) => {
      const url = new URL(request.url, redirectUri);
      if (
        serveOAuthPickerRoute({
          request,
          response,
          url,
          scopePicker,
          scopes,
          requiredScopes,
          setSelectedScopes: (value) => {
            selectedScopes = value;
          },
          makeAuthorization,
        })
      )
        return;
      if (url.pathname !== "/oauth/callback") {
        response.writeHead(404);
        response.end();
        return;
      }
      if (url.searchParams.get("state") !== state) {
        reject(callbackStateError(response));
        return;
      }
      const error = url.searchParams.get("error");
      if (error) {
        reject(callbackProviderError(response, error, url.searchParams.get("error_description")));
        return;
      }
      resolve({ code: url.searchParams.get("code"), response });
    }),
  );
  return { callback, getSelectedScopes: () => selectedScopes };
}
