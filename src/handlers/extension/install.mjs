import { extensionRoot } from "../../extensions.mjs";
import { extensionDestination } from "./destination.mjs";
import { extensionPathsOverlap } from "./path-policy.mjs";
import { loadExtensionSource } from "./source.mjs";
import { installExtensionTransaction } from "./install-transaction.mjs";

export function installExtension({ opts, printer, fail, fsImpl, homeDir }) {
  const loaded = loadExtensionSource({ sourcePath: opts.path, fsImpl, fail });
  if (!loaded) return;
  const { source, manifest } = loaded;
  const root = extensionRoot(homeDir);
  const destination = extensionDestination(root, manifest.name);
  if (!destination) {
    fail("Invalid cfhub extension manifest");
    return;
  }
  if (extensionPathsOverlap(source, destination, fsImpl)) {
    fail("Extension source must not overlap its install destination");
    return;
  }
  fsImpl.mkdirSync(root, { recursive: true });
  let installed = false;
  try {
    fsImpl.lstatSync(destination);
    installed = true;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  if (installed) {
    fail(`Extension ${manifest.name} is installed. Run the upgrade command.`);
    return;
  }
  const cleanupErrors = installExtensionTransaction({
    source,
    destination,
    root,
    name: manifest.name,
    fsImpl,
  });
  cleanupErrors.forEach(({ path: cleanupPath, error }) => {
    printer.error(`Install completed, but cleanup failed for ${cleanupPath}: ${error.message}.`);
  });
  return printer.log(`Installed extension ${manifest.name}`);
}
