import { REQUIRED_OAUTH_SCOPES } from "./oauth-page-metadata.mjs";
import { scopeCategories } from "./oauth-scope-catalog.mjs";
import moduleCatalog from "../data/cloudflare-oauth-modules.json" with { type: "json" };

const categories = scopeCategories;
const modules = moduleCatalog.modules;

export function serializeOAuthScopeModel(
  model = { categories, modules, requiredScopes: REQUIRED_OAUTH_SCOPES },
) {
  return JSON.stringify(model).replace(/</g, "\\u003c");
}
