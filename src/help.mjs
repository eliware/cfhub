import { TOP_LEVEL_HELP } from "./help/top-level-text.mjs";

export function printHelp(printer = console) {
  printer.log(TOP_LEVEL_HELP);
}
