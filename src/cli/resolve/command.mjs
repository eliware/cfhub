import { discoverExtensions } from "../../extensions.mjs";
import { expandCommandAlias } from "../alias-expansion.mjs";
import { resolveExtensionCommand } from "../resolve-extension-command.mjs";
import { resolveCommandHelp } from "./command-help.mjs";
import { validateCommandAction } from "../validate-command/action.mjs";
import { validateCommandResource } from "../validate-command/resource.mjs";

export async function resolveCommand({
  args,
  opts,
  printer,
  homeDir,
  fsImpl,
  exit,
  loadBody,
  loadCommand,
}) {
  ({ args, opts } = expandCommandAlias({ args, opts, homeDir, fsImpl }));
  const [resource, action] = args;
  const extensionManifest = discoverExtensions(homeDir, fsImpl).find(
    (manifest) => manifest.commands[resource],
  );
  const resourceValidation = validateCommandResource({
    resource,
    extensionManifest,
    printer,
    exit,
  });
  if (resourceValidation) return resourceValidation;
  const validation = validateCommandAction({ resource, action, printer, exit });
  if (validation) return validation;
  const help = resolveCommandHelp({ args, opts, resource, action, extensionManifest, printer });
  if (help) return help;
  if (extensionManifest) {
    return resolveExtensionCommand({
      extensionManifest,
      resource,
      action,
      opts,
      printer,
      homeDir,
      fsImpl,
      loadBody,
      loadCommand,
    });
  }
  return { done: false, args, opts, resource, action };
}
