import { installExtension } from "./extension-install.mjs";
import { upgradeExtension } from "./extension-upgrade.mjs";
import { removeExtension } from "./extension-remove.mjs";

export function mutateExtension({ action, opts, printer, fail, fsImpl, homeDir }) {
  if (action === "install") return installExtension({ opts, printer, fail, fsImpl, homeDir });
  if (action === "upgrade") return upgradeExtension({ opts, printer, fail, fsImpl, homeDir });
  return removeExtension({ opts, printer, fail, fsImpl, homeDir });
}
