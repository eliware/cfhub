import { routeOAuthCallback } from "./callback/routes.mjs";
import { serveOAuthPickerRoute } from "./picker/routes.mjs";

export function createOAuthCallback({
  server,
  redirectUri,
  state,
  scopePicker,
  scopes,
  pickerScopes = [],
  requiredScopes,
  makeAuthorization,
}) {
  let selectedScopes = [...new Set([...requiredScopes, ...scopes])];
  const callback = new Promise((resolve, reject) =>
    server.setOAuthRequestHandler(async (request, response) => {
      const url = new URL(request.url, redirectUri);
      if (
        await serveOAuthPickerRoute({
          request,
          response,
          url,
          scopePicker,
          scopes,
          pickerScopes,
          requiredScopes,
          setSelectedScopes: (value) => {
            selectedScopes = value;
          },
          makeAuthorization,
          onError: reject,
        })
      )
        return;
      const result = routeOAuthCallback({ url, state, response });
      if (result.error) reject(result.error);
      else if (!result.handled) resolve({ code: result.code, response });
      return true;
    }),
  );
  callback.catch(() => {});
  return { callback, getSelectedScopes: () => selectedScopes };
}
