import { toJsonOutput } from "../output-printers.mjs";
import { renderTemplate, selectJson } from "../output-selection.mjs";

export function createCommandContext({
  resource,
  action,
  opts,
  cf,
  body,
  outputJson,
  printer,
  log,
  exit,
}) {
  const fail = (message, code = 1) => {
    printer.error(message);
    exit(code);
  };
  return {
    resource,
    cf,
    action,
    opts,
    body,
    outputJson,
    printer,
    toJsonOutput: (value) =>
      opts.template
        ? log(renderTemplate(selectJson(value, opts.jq), opts.template))
        : toJsonOutput(selectJson(value, opts.jq), log),
    fail,
  };
}
