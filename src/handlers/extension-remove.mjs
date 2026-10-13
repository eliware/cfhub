import { extensionRoot } from "../extensions.mjs";

export function removeExtension({ opts, printer, fail, fsImpl, homeDir }) {
  if (!opts.name) {
    fail("Missing --name");
    return;
  }
  if (!opts.force) {
    fail("Refusing extension removal without --force");
    return;
  }
  fsImpl.rmSync(`${extensionRoot(homeDir)}/${opts.name}`, { recursive: true, force: true });
  return printer.log(`Removed extension ${opts.name}`);
}
