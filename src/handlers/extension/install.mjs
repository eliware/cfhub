import { extensionRoot } from "../../extensions.mjs";
import { extensionPathsOverlap, loadExtensionSource } from "./source.mjs";
import { extensionDestination } from "./destination.mjs";

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
  if (typeof fsImpl.existsSync === "function" && fsImpl.existsSync(destination)) {
    fail(`Extension ${manifest.name} is installed. Run the upgrade command.`);
    return;
  }
  fsImpl.cpSync(source, destination, { recursive: true });
  return printer.log(`Installed extension ${manifest.name}`);
}
