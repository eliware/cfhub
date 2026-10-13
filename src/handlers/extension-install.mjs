import { extensionRoot, validateExtensionManifest } from "../extensions.mjs";

export function installExtension({ opts, printer, fail, fsImpl, homeDir }) {
  if (!opts.path) {
    fail("Missing --path to an extension directory");
    return;
  }
  const source = opts.path;
  const manifest = JSON.parse(fsImpl.readFileSync(`${source}/cf-extension.json`, "utf8"));
  if (!validateExtensionManifest(manifest)) {
    fail("Invalid cfhub extension manifest");
    return;
  }
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
