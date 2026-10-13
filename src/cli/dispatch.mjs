import { createHandlerMap } from "./handlers.mjs";
import { formatCloudflareError } from "../errors.mjs";
import { printHelp } from "../help.mjs";

export async function dispatchCommand({
  resource,
  action,
  outputJson,
  common,
  terminal,
  printer,
  exit,
  handlers,
}) {
  const dispatch = createHandlerMap(handlers);
  if (!dispatch[resource]) {
    printHelp(printer);
    return exit(1);
  }
  try {
    const result = await dispatch[resource](common);
    await terminal.flush();
    return result;
  } catch (error) {
    const message = formatCloudflareError(error, { resource, action, outputJson });
    if (!message) throw error;
    printer.error(message);
    return exit(1);
  }
}
