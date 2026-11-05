import { commandNamesFor } from "../../../suggestions.mjs";
import { actionVerbs, resourceLabels } from "./catalog.mjs";
import { positional } from "./arguments.mjs";
import { optionLines, requiredOptions } from "./options.mjs";

function describe(resource, action) {
  if (resource === "api") return "Make an authenticated request to Cloudflare.";
  return `${actionVerbs[action]} ${resourceLabels[resource]}.`;
}

function usage(resource, action) {
  const command = resource === "api" ? "cfhub api <path>" : `cfhub ${resource} ${action}`;
  const args = positional(resource, action);
  const flags = requiredOptions(resource, action);
  return [command, args, flags, "[flags]"].filter(Boolean).join(" ");
}

function argumentsFor(resource, action) {
  if (resource === "api") return "  <path>                 Relative Cloudflare API path.";
  if (resource === "alias" && action === "set")
    return "  <name> <command>      Alias name and command to save.";
  if (resource === "alias" && action === "delete")
    return "  <name>                 Name of the alias to remove.";
  if (resource === "config" && ["get", "set", "unset"].includes(action))
    return `  <name>${action === "set" ? " <value>" : ""}              Configuration key${action === "set" ? " and value" : ""}.`;
  return "  Required resource identifiers appear as options in USAGE.";
}

export function actionCommandHelp(resource, action) {
  if (resource !== "api" && !commandNamesFor(resource).includes(action)) return null;
  return [
    describe(resource, action),
    "",
    "USAGE",
    `  ${usage(resource, action)}`,
    "",
    "ARGUMENTS",
    argumentsFor(resource, action),
    "",
    "OPTIONS",
    ...optionLines(resource, action),
    "",
    "DEFAULTS",
    "  Output is text unless you select JSON. Environment variables supply account and zone IDs when available.",
  ].join("\n");
}
