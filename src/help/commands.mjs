import { authCommandHelp } from "./auth-commands.mjs";
import { resourceCommandHelp } from "./resource-commands.mjs";
import { localCommandHelp } from "./local-commands.mjs";

export function printCommandHelp(resource, action, printer = console) {
  const key = `${resource} ${action || ""}`.trim();
  const help = authCommandHelp(key) || resourceCommandHelp(key) || localCommandHelp(key);
  printer.log(
    help ||
      `${resource} ${action || ""}\n\nUSAGE\n  cfhub ${resource} ${action || "<subcommand>"} [flags]\n\nUse 'cfhub ${resource} --help' for available subcommands.`,
  );
}
