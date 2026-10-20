import { REQUIRED_OAUTH_SCOPES } from "./required.mjs";
import { scopeCategories } from "./catalog.mjs";
import moduleCatalog from "../../../data/cloudflare-oauth-modules.json" with { type: "json" };

export function createOAuthScopeModel() {
  return {
    categories: scopeCategories,
    modules: moduleCatalog.modules,
    requiredScopes: REQUIRED_OAUTH_SCOPES,
  };
}
