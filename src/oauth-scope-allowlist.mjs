import { scopeCategories } from "./oauth-scope-catalog.mjs";

export const ALLOWED_OAUTH_SCOPES = new Set(
  Object.values(scopeCategories).flatMap((features) =>
    features.flatMap((feature) => feature.scopes.map((scope) => scope.scope)),
  ),
);
