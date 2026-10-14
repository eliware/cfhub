import * as fs from "node:fs";
import { dispatchCommand } from "./cli/dispatch.mjs";
import os from "node:os";
import { parseArgs } from "./args.mjs";
import { loadBody } from "./cli/body-loader.mjs";
import { resolveCommand } from "./cli/resolve-command.mjs";
import { loadProjectEnv } from "./env.mjs";
import { createCloudflareClient } from "./cloudflare.mjs";
import { createCommandContext } from "./cli/command-context.mjs";
import { runExtensionCommand } from "./cli/extension-command.mjs";
import { handleLocalCommand } from "./cli/local-commands.mjs";
import { checkForUpdate } from "./update-check.mjs";
import { authorizeCommand } from "./cli/authorization.mjs";
import { createOutputContext } from "./cli/output-context.mjs";

export async function run({
  argv = process.argv.slice(2),
  env = process.env,
  cfFactory = createCloudflareClient,
  loadEnv = loadProjectEnv,
  printer = console,
  fsImpl = fs,
  handlers = {},
  projectRoot = process.cwd(),
  homeDir = os.homedir(),
  exit = (code) => process.exit(code),
  updateCheck = checkForUpdate,
} = {}) {
  let { args, opts } = parseArgs(argv);
  const local = handleLocalCommand({ args, opts, printer, homeDir, fsImpl });
  if (local.handled) return local.result;
  let resource = args[0];
  let action = args[1];
  const resolution = await resolveCommand({ args, opts, printer, homeDir, fsImpl, exit, loadBody });
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
    log: printer.log,
    exit,
  });
  common.env = env;
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
