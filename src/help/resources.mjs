import { coreResourceHelp } from "./core-resources.mjs";
import { securityResourceHelp } from "./security-resources.mjs";
import { platformResourceHelp } from "./platform-resources.mjs";

export function printResourceHelp(resource, printer = console) {
  const help =
    coreResourceHelp(resource) || securityResourceHelp(resource) || platformResourceHelp(resource);
  printer.log(help || `Unknown resource: ${resource}`);
}
