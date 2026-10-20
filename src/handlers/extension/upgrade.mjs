import { extensionRoot } from "../../extensions.mjs";
import { extensionDestination } from "./destination.mjs";
import { extensionPathsOverlap } from "./path-policy.mjs";
import { loadExtensionSource } from "./source.mjs";
import { replaceExtension } from "./upgrade-transaction.mjs";

export function upgradeExtension({ opts, printer, fail, fsImpl, homeDir }) {
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
  if (typeof fsImpl.existsSync !== "function" || !fsImpl.existsSync(destination)) {
    fail(`Extension ${manifest.name} is not installed. Run the install command.`);
    return;
  }
  replaceExtension({ source, destination, root, name: manifest.name, fsImpl });
  return printer.log(`Upgraded extension ${manifest.name}`);
}
