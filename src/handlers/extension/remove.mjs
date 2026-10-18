import { extensionRoot } from "../../extensions.mjs";
import { extensionDestination } from "./destination.mjs";

export function removeExtension({ opts, printer, fail, fsImpl, homeDir }) {
  if (!opts.name) {
    fail("Missing --name");
    return;
  }
  if (!opts.force) {
    fail("Refusing extension removal without --force");
    return;
  }
  const destination = extensionDestination(extensionRoot(homeDir), opts.name);
  if (!destination) {
    fail("Invalid extension name");
    return;
  }
  fsImpl.rmSync(destination, { recursive: true, force: true });
  return printer.log(`Removed extension ${opts.name}`);
}
