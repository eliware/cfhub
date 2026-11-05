import { createTerminalOutput } from "../terminal.mjs";
import { terminalOptions } from "./terminal/options.mjs";
import { dashboardUrl } from "./dashboard-url.mjs";
import { scheduleUpdateNotice } from "./update-notice/context.mjs";
import { readSettings } from "../settings.mjs";

export function createOutputContext({
  opts,
  printer,
  homeDir,
  env,
  fsImpl,
  updateCheck,
  terminalFactory = createTerminalOutput,
}) {
  const settings = readSettings(homeDir, fsImpl);
  const { outputJson, color, width, pager, useTerminal } = terminalOptions({ opts, settings });
  const terminal = useTerminal
    ? terminalFactory({
        printer,
        json: outputJson,
        color,
        width,
        pager,
      })
    : { ...printer, flush: async () => {} };
  scheduleUpdateNotice({
    outputJson,
    opts,
    settings,
    pager,
    terminal,
    printer,
    updateCheck,
    homeDir,
    env,
    fsImpl,
  });
  const commandPrinter = opts.quiet ? { ...terminal, log: () => {} } : terminal;
  if (opts.web) {
    commandPrinter.log(dashboardUrl(opts));
    return { handled: true, outputJson, terminal, commandPrinter };
  }
  return { handled: false, outputJson, terminal, commandPrinter };
}
