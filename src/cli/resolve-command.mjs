import { parseArgs } from "../args.mjs";
import { tokenizeCommand } from "../alias-tokenizer.mjs";
import { discoverExtensions } from "../extensions.mjs";
import { readAliases } from "../aliases.mjs";
import { resolveExtensionCommand } from "./resolve-extension-command.mjs";
import { resolveCommandHelp } from "./resolve-command-help.mjs";
import { validateCommandAction } from "./validate-command-action.mjs";
import { validateCommandResource } from "./validate-command-resource.mjs";

export async function resolveCommand({ args, opts, printer, homeDir, fsImpl, exit, loadBody }) {
  let [resource, action] = args;
  const expansion = readAliases(homeDir, fsImpl)[resource];
  if (expansion) {
    const expanded = parseArgs(tokenizeCommand(`${expansion} ${args.slice(1).join(" ")}`.trim()));
    args = expanded.args;
    opts = { ...expanded.opts, ...opts };
    [resource, action] = args;
  }
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
    });
  }
  const validation = validateCommandAction({ resource, action, printer, exit });
  if (validation) return validation;
  return { done: false, args, opts, resource, action };
}
