import { routeOAuthCallback } from "./oauth-callback-routes.mjs";
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
      const result = routeOAuthCallback({ url, state, response });
      if (result.error) reject(result.error);
      else if (!result.handled) resolve({ code: result.code, response });
    }),
  );
  return { callback, getSelectedScopes: () => selectedScopes };
}
