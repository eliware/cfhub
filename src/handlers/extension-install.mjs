import { extensionRoot } from "../extensions.mjs";
import { loadExtensionSource } from "./extension-source.mjs";
import { extensionDestination } from "./extension-destination.mjs";

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
  fsImpl.mkdirSync(root, { recursive: true });
  if (typeof fsImpl.existsSync === "function" && fsImpl.existsSync(destination)) {
    fail(`Extension ${manifest.name} is already installed. Use upgrade instead.`);
    return;
  }
  fsImpl.cpSync(source, destination, { recursive: true });
  return printer.log(`Installed extension ${manifest.name}`);
}
