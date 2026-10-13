import { installExtension } from "./extension-install.mjs";
import { removeExtension } from "./extension-remove.mjs";

export function mutateExtension({ action, opts, printer, fail, fsImpl, homeDir }) {
  if (action === "install" || action === "upgrade") {
    return installExtension({ action, opts, printer, fail, fsImpl, homeDir });
  }
  return removeExtension({ opts, printer, fail, fsImpl, homeDir });
}
