import { VERSION } from "../version.mjs";
import { printHelp } from "../help.mjs";
import { handleAlias } from "../handlers/alias.mjs";
import { handleConfigCommand } from "../handlers/config.mjs";

export function handleLocalCommand({ args, opts, printer, homeDir, fsImpl }) {
  if (opts.version) return { handled: true, result: printer.log(VERSION) };
  if (!args.length) return { handled: true, result: printHelp(printer) };
  if (args[0] === "alias")
    return { handled: true, result: handleAlias({ args, opts, printer, homeDir, fsImpl }) };
  if (args[0] === "config")
    return { handled: true, result: handleConfigCommand({ args, opts, printer, homeDir, fsImpl }) };
  return { handled: false };
}
