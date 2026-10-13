export function selectOAuthModules(modules, scopes) {
  return modules.filter((module) => module.scopes.every((scope) => scopes.includes(scope)));
}
