import { extensionRoot } from "../extensions.mjs";
import { loadExtensionSource } from "./extension-source.mjs";

export function installExtension({ opts, printer, fail, fsImpl, homeDir }) {
  const loaded = loadExtensionSource({ sourcePath: opts.path, fsImpl, fail });
  if (!loaded) return;
  const { source, manifest } = loaded;
  const root = extensionRoot(homeDir);
  fsImpl.mkdirSync(root, { recursive: true });
  const destination = `${root}/${manifest.name}`;
  if (typeof fsImpl.existsSync === "function" && fsImpl.existsSync(destination)) {
    fail(`Extension ${manifest.name} is already installed. Use upgrade instead.`);
    return;
  }
  fsImpl.cpSync(source, destination, { recursive: true });
  return printer.log(`Installed extension ${manifest.name}`);
}
