import { failurePage } from "./oauth-result-pages.mjs";
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
        response.writeHead(400, { "content-type": "text/html; charset=utf-8" });
        response.end(
          failurePage({
            title: "Authorization request expired",
            detail:
              "This callback no longer matches the login request. Start a new login from the cfhub command line and try again.",
          }),
        );
        reject(
          new Error(
            "OAuth login expired or was opened in another browser. Run `cfhub auth login` again using the newest URL.",
          ),
        );
        return;
      }
      const error = url.searchParams.get("error");
      if (error) {
        const detail =
          url.searchParams.get("error_description") ||
          "The authorization request was not completed.";
        response.writeHead(400, { "content-type": "text/html; charset=utf-8" });
        response.end(
          failurePage({
            title: error === "access_denied" ? "Authorization cancelled" : "Authorization failed",
            detail,
          }),
        );
        reject(new Error(`Cloudflare authorization failed: ${error}`));
        return;
      }
      resolve({ code: url.searchParams.get("code"), response });
    }),
  );
  return { callback, getSelectedScopes: () => selectedScopes };
}
