import { loadExtensionCommand } from "../extensions.mjs";
import { toJsonOutput as printJson } from "../output-printers.mjs";

export async function resolveExtensionCommand({
  extensionManifest,
  resource,
  action,
  opts,
  printer,
  homeDir,
  fsImpl,
  loadBody,
  loadCommand = loadExtensionCommand,
  toJson = printJson,
}) {
  const handler = await loadCommand(extensionManifest, resource, homeDir);
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
      toJsonOutput: (value) => toJson(value, printer.log),
      fail: (message) => printer.error(message),
    }),
  };
}
