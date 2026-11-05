import { authCommandHelp } from "./auth/commands.mjs";
import { resourceCommandHelp } from "./resource-commands.mjs";
import { localCommandHelp } from "./local-commands.mjs";

export function printCommandHelp(resource, action, printer = console) {
  const key = `${resource} ${action || ""}`.trim();
  const authHelp = authCommandHelp(key);
  const help =
    (key === "auth login" ? authHelp : null) ||
    resourceCommandHelp(key) ||
    authHelp ||
    localCommandHelp(key);
  printer.log(
    help ||
      `${resource} ${action || ""}\n\nUSAGE\n  cfhub ${resource} ${action || "<subcommand>"} [flags]\n\nUse 'cfhub ${resource} --help' for available subcommands.`,
  );
}
