import { selectJson } from "../../json-selection.mjs";
import { renderTemplate } from "../../template-rendering.mjs";

export function renderApiOutput(result, opts) {
  const selected = selectJson(result, opts.jq);
  return opts.template
    ? renderTemplate(selected, opts.template)
    : JSON.stringify(selected, null, 2);
}
