import { createAuthDependencies } from "./dependencies.mjs";

export function createAuthContext(context = {}) {
  const {
    resource = "oauth",
    cf,
    action,
    opts,
    outputJson,
    printer = console,
    toJsonOutput,
    fail = () => {},
    profileHome,
    profileFs,
    env = process.env,
  } = context;
  const dependencies = createAuthDependencies(context);
  return {
    resource,
    cf,
    action,
    opts,
    outputJson,
    printer,
    toJsonOutput,
    fail,
    profileHome,
    profileFs,
    env,
    ...dependencies,
    data: dependencies.read(profileHome, profileFs),
  };
}
