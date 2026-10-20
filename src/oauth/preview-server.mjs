import { createOAuthAuthorization } from "./authorization.mjs";
import { REQUIRED_OAUTH_SCOPES } from "./page-metadata.mjs";
import { serveOAuthPickerRoute } from "./picker/routes.mjs";
import { DEFAULT_OAUTH_SCOPES } from "./scopes.mjs";

export function registerOAuthPickerPreview(
  server,
  {
    host = "127.0.0.1",
    port = 1020,
    scopes = DEFAULT_OAUTH_SCOPES,
    clientId = "preview-client",
  } = {},
) {
  let selectedScopes = [...new Set([...REQUIRED_OAUTH_SCOPES, ...scopes])];
  const redirectUri = `http://${host}:${port}/oauth/callback`;
  const { makeAuthorization } = createOAuthAuthorization({ clientId, redirectUri });
  server.setOAuthRequestHandler((request, response) =>
    serveOAuthPickerRoute({
      request,
      response,
      url: new URL(request.url, `http://${host}:${port}`),
      scopePicker: true,
      scopes,
      requiredScopes: REQUIRED_OAUTH_SCOPES,
      setSelectedScopes: (value) => {
        selectedScopes = value;
      },
      makeAuthorization,
    }),
  );
  return { server, getSelectedScopes: () => selectedScopes };
}
