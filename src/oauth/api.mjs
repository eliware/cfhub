export { collectOAuthSummary } from "./pages.mjs";
export { copyrightYear, REQUIRED_OAUTH_SCOPES } from "./page-metadata.mjs";
export { openBrowser } from "./browser.mjs";
export { DEFAULT_OAUTH_CLIENT_ID, revokeOAuth } from "./tokens.mjs";
export { refreshOAuth } from "./refresh.mjs";
export { DEFAULT_OAUTH_SCOPES } from "./scopes.mjs";
import { DEFAULT_WEB_PORT } from "../web/port.mjs";

export const DEFAULT_OAUTH_PORTS = Array.from(
  { length: 5 },
  (_, index) => DEFAULT_WEB_PORT + index,
);
