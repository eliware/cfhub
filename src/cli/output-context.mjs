import { VERSION } from "../version.mjs";
import { createTerminalOutput, terminalColorMode, terminalWidth } from "../terminal.mjs";
import { checkForUpdate, updateNotice } from "../update-check.mjs";

export function createOutputContext({ opts, printer, homeDir, env, fsImpl, updateCheck }) {
  const outputJson = opts.json || opts.output === "json";
  const settings = readSettings(homeDir, fsImpl);
  if (
    !outputJson &&
    !opts.quiet &&
    settings["update-check"] !== false &&
    settings["update-check"] !== "false"
  ) {
    void updateCheck({ currentVersion: VERSION, homeDir, env, fsImpl })
      .then((latestVersion) => {
        const notice = updateNotice(latestVersion, VERSION);
        if (notice) printer.error(notice);
      })
      .catch(() => {});
  }
  const color = terminalColorMode(opts.color ?? settings.color, {
    isTTY: Boolean(process.stdout?.isTTY),
  });
  const pagerSetting =
    opts.pager === true
      ? settings.pager || process.env.PAGER || "less"
      : opts.pager || settings.pager;
  const pager =
    outputJson || opts["no-pager"] || opts.quiet || pagerSetting === "never"
      ? null
      : pagerSetting || null;
  const useTerminal = Boolean(
    pager ||
    opts.color !== undefined ||
    opts.width !== undefined ||
    settings.color ||
    settings.width,
  );
  const terminal = useTerminal
    ? createTerminalOutput({
        printer,
        json: outputJson,
        color,
        width: terminalWidth(opts.width ?? settings.width),
        pager,
      })
    : { ...printer, flush: async () => {} };
  const commandPrinter = opts.quiet ? { ...terminal, log: () => {} } : terminal;
  if (opts.web) {
    const target = opts["zone-id"]
      ? `zones/${opts["zone-id"]}`
      : opts["account-id"]
        ? `accounts/${opts["account-id"]}`
        : "";
    commandPrinter.log(`https://dash.cloudflare.com/${target}`);
    return { handled: true, outputJson, terminal, commandPrinter };
  }
  return { handled: false, outputJson, terminal, commandPrinter };
}

import { readSettings } from "../settings.mjs";
export { checkForUpdate };
