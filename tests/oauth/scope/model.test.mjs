import { createOAuthScopeModel } from "../../../src/oauth/scope/model.mjs";
import { REQUIRED_OAUTH_SCOPES } from "../../../src/oauth/page-metadata.mjs";
import { scopeCategories } from "../../../src/oauth/scope/catalog.mjs";
import moduleCatalog from "../../../data/cloudflare-oauth-modules.json" with { type: "json" };

test("creates the OAuth scope model from the catalogs and required scopes", () => {
  expect(createOAuthScopeModel()).toEqual({
    categories: scopeCategories,
    modules: moduleCatalog.modules,
    requiredScopes: REQUIRED_OAUTH_SCOPES,
  });
});
