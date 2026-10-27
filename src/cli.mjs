import { dispatchCommand } from "./cli/dispatch.mjs";
import { parseArgs } from "./args.mjs";
import { loadBody } from "./cli/body-loader.mjs";
import { resolveCommand } from "./cli/resolve/command.mjs";
import { createCommandContext } from "./cli/command/context.mjs";
import { runExtensionCommand } from "./cli/extension-command.mjs";
import { handleLocalCommand } from "./cli/local-commands.mjs";
import { authorizeCommand } from "./cli/authorization.mjs";
import { createOutputContext } from "./cli/output-context.mjs";
import { createCliDependencies } from "./cli/dependencies.mjs";

export async function run(options = {}) {
  const {
    argv,
    env,
    cfFactory,
    loadEnv,
    printer,
    fsImpl,
    handlers,
    projectRoot,
    homeDir,
    exit,
    updateCheck,
    loadCommand,
  } = createCliDependencies(options);
  let { args, opts } = parseArgs(argv);
  const local = handleLocalCommand({ args, opts, printer, homeDir, fsImpl });
  if (local.handled) return local.result;
  let resource = args[0];
  let action = args[1];
  const resolution = await resolveCommand({
    args,
    opts,
    printer,
    homeDir,
    fsImpl,
    exit,
    loadBody,
    loadCommand,
  });
  if (resolution.done) return resolution.value;
  ({ args, opts, resource, action } = resolution);

  if (resource === "extension")
    return runExtensionCommand({ action, opts, printer, fsImpl, homeDir });

  const authorization = await authorizeCommand({
    resource,
    action,
    opts,
    env,
    loadEnv,
    projectRoot,
    homeDir,
    fsImpl,
    printer,
    exit,
    cfFactory,
  });
  if (!authorization.allowed) return authorization.result;
  const { cf } = authorization;
  const output = createOutputContext({ opts, printer, homeDir, env, fsImpl, updateCheck });
  if (output.handled) return;
  const { outputJson, terminal, commandPrinter } = output;
  const body = loadBody(opts, fsImpl);
  const common = createCommandContext({
    resource,
    action,
    opts,
    cf,
    body,
    outputJson,
    printer: commandPrinter,
    env,
    log: printer.log,
    exit,
  });
  return dispatchCommand({
    resource,
    action,
    outputJson,
    common,
    terminal,
    printer,
    exit,
    handlers,
  });
}
