import { parseArgs, tokenizeCommand } from "../args.mjs";
import { discoverExtensions, loadExtensionCommand } from "../extensions.mjs";
import { readAliases } from "../aliases.mjs";
import { printCommandHelp } from "../help/commands.mjs";
import { printResourceHelp } from "../help/resources.mjs";
import { commandNamesFor, resourceNames, suggestCommand } from "../suggestions.mjs";
import { toJsonOutput } from "../output.mjs";

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
    const handler = await loadExtensionCommand(extensionManifest, resource, homeDir);
    if (!handler)
      return { done: true, value: printer.error(`Extension command is not loadable: ${resource}`) };
    return {
      done: true,
      value: handler({
        cf: null,
        action,
        opts,
        body: loadBody(opts, fsImpl),
        outputJson: opts.json || opts.output === "json",
        printer,
        toJsonOutput: (value) => toJsonOutput(value, printer.log),
        fail: (message) => printer.error(message),
      }),
    };
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
