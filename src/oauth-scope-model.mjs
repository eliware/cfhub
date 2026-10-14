import { REQUIRED_OAUTH_SCOPES } from "./oauth-page-metadata.mjs";
import { scopeCategories } from "./oauth-scope-catalog.mjs";
import moduleCatalog from "../data/cloudflare-oauth-modules.json" with { type: "json" };

export function createOAuthScopeModel() {
  return {
    categories: scopeCategories,
    modules: moduleCatalog.modules,
    requiredScopes: REQUIRED_OAUTH_SCOPES,
  };
}
