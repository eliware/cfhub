import { toJsonOutput } from "../../output/printers.mjs";
import { selectJson } from "../../json-selection.mjs";
import { renderTemplate } from "../../template-rendering.mjs";

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
