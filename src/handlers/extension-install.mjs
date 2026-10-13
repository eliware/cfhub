import { extensionRoot, validateExtensionManifest } from "../extensions.mjs";

export function installExtension({ action, opts, printer, fail, fsImpl, homeDir }) {
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
  fsImpl.rmSync(`${root}/${manifest.name}`, { recursive: true, force: true });
  fsImpl.cpSync(source, `${root}/${manifest.name}`, { recursive: true });
  return printer.log(
    `${action === "install" ? "Installed" : "Upgraded"} extension ${manifest.name}`,
  );
}
