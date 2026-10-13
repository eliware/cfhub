import { VERSION } from "../version.mjs";
import { createTerminalOutput } from "../terminal.mjs";
import { terminalOptions } from "./terminal-options.mjs";
import { dashboardUrl } from "./dashboard-url.mjs";
import { checkForUpdate } from "../update-check.mjs";
import { showUpdateNotice } from "./update-notice.mjs";

export function createOutputContext({ opts, printer, homeDir, env, fsImpl, updateCheck }) {
  const settings = readSettings(homeDir, fsImpl);
  const { outputJson, color, width, pager, useTerminal } = terminalOptions({ opts, settings });
  if (
    !outputJson &&
    !opts.quiet &&
    settings["update-check"] !== false &&
    settings["update-check"] !== "false"
  ) {
    void showUpdateNotice({ updateCheck, currentVersion: VERSION, homeDir, env, fsImpl, printer });
  }
  const terminal = useTerminal
    ? createTerminalOutput({
        printer,
        json: outputJson,
        color,
        width,
        pager,
      })
    : { ...printer, flush: async () => {} };
  const commandPrinter = opts.quiet ? { ...terminal, log: () => {} } : terminal;
  if (opts.web) {
    commandPrinter.log(dashboardUrl(opts));
    return { handled: true, outputJson, terminal, commandPrinter };
  }
  return { handled: false, outputJson, terminal, commandPrinter };
}

import { readSettings } from "../settings.mjs";
export { checkForUpdate };
