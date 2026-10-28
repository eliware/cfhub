import { callbackCodeError, callbackProviderError, callbackStateError } from "./response.mjs";

export function routeOAuthCallback({ url, state, response }) {
  if (url.pathname !== "/oauth/callback") {
    response.writeHead(404);
    response.end();
    return { handled: true };
  }
  if (url.searchParams.get("state") !== state)
    return { handled: true, error: callbackStateError(response) };
  const error = url.searchParams.get("error");
  if (error)
    return {
      handled: true,
      error: callbackProviderError(response, error, url.searchParams.get("error_description")),
    };
  const code = url.searchParams.get("code");
  if (!code) return { handled: true, error: callbackCodeError(response) };
  return { handled: false, code };
}
