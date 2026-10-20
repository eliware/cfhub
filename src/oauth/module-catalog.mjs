import moduleCatalog from "../../data/cloudflare-oauth-modules.json" with { type: "json" };

export { moduleCatalog };

export function selectOAuthModules(modules, scopes) {
  return modules.filter((module) => {
    const readScopes = module.scopes.filter((scope) => scope.endsWith(".read"));
    const required = readScopes.length ? readScopes : module.scopes;
    return required.every((scope) => scopes.includes(scope));
  });
}
