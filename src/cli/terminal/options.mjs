import { terminalColorMode, terminalWidth } from "../../terminal/format.mjs";
import { requiresTerminalOutput } from "./use-policy.mjs";

export function terminalOptions({
  opts,
  settings,
  env = process.env,
  isTTY = Boolean(process.stdout?.isTTY),
}) {
  const outputJson = opts.output === "text" ? false : opts.json || opts.output === "json";
  const color = terminalColorMode(opts.color ?? settings.color, { isTTY });
  const pagerSetting =
    opts.pager === true ? settings.pager || env.PAGER || "less" : opts.pager || settings.pager;
  const pager =
    outputJson || opts["no-pager"] || opts.quiet || pagerSetting === "never"
      ? null
      : pagerSetting || null;
  const useTerminal = requiresTerminalOutput({ pager, opts, settings });
  return {
    outputJson,
    color,
    width: terminalWidth(opts.width ?? settings.width),
    pager,
    useTerminal,
  };
}
