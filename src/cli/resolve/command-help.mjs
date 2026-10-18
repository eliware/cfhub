import { printCommandHelp } from "../../help/commands.mjs";
import { printResourceHelp } from "../../help/resources.mjs";

export function resolveCommandHelp({ args, opts, resource, action, extensionManifest, printer }) {
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
  return null;
}
