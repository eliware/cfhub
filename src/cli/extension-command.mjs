import { handleExtension } from "../handlers/extension.mjs";
import { toJsonOutput } from "../output/printers.mjs";

export function runExtensionCommand({ action, opts, printer, fsImpl, homeDir }) {
  return handleExtension({
    action,
    opts,
    outputJson: opts.json || opts.output === "json",
    printer,
    toJsonOutput: (value) => toJsonOutput(value, printer.log),
    fail: (message) => printer.error(message),
    fsImpl,
    homeDir,
  });
}
