import { VERSION } from "../../version.mjs";
import { showUpdateNotice } from "../update-notice.mjs";

export function scheduleUpdateNotice({
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
}) {
  if (
    outputJson ||
    opts.quiet ||
    settings["update-check"] === false ||
    settings["update-check"] === "false"
  )
    return;
  const noticePrinter = pager ? { error: (message) => terminal.log(message) } : printer;
  void showUpdateNotice({
    updateCheck,
    currentVersion: VERSION,
    homeDir,
    env,
    fsImpl,
    printer: noticePrinter,
  });
}
