import { parseArgs } from "../args.mjs";
import { tokenizeCommand } from "../alias-tokenizer.mjs";
import { discoverExtensions } from "../extensions.mjs";
import { readAliases } from "../aliases.mjs";
import { printCommandHelp } from "../help/commands.mjs";
import { printResourceHelp } from "../help/resources.mjs";
import { commandNamesFor, resourceNames, suggestCommand } from "../suggestions.mjs";
import { resolveExtensionCommand } from "./resolve-extension-command.mjs";

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
  if (!extensionManifest && !resourceNames.includes(resource)) {
    const suggestion = suggestCommand("resource", resource);
    if (suggestion) {
      printer.error(
        `unknown command "${resource}" for "cfhub"\n\nDid you mean this?\n\t${suggestion}\n\nUsage: cfhub <command> <subcommand> [flags]`,
      );
      return { done: true, value: exit(1) };
    }
  }
  if (opts.help) {
    return {
      done: true,
      value:
        args.length > 1
          ? printCommandHelp(resource, action, printer)
          : printResourceHelp(resource, printer),
    };
  }
  if (args.length === 1 && !extensionManifest)
    return { done: true, value: printResourceHelp(resource, printer) };
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
  if (
    resource !== "api" &&
    action &&
    commandNamesFor(resource).length &&
    !commandNamesFor(resource).includes(action)
  ) {
    const suggestion = suggestCommand(resource, action);
    printer.error(
      `unknown command "${action}" for "cfhub ${resource}"${suggestion ? `\n\nDid you mean this?\n\t${suggestion}` : ""}\n\nUsage: cfhub ${resource} <command> [flags]`,
    );
    return { done: true, value: exit(1) };
  }
  return { done: false, args, opts, resource, action };
}
