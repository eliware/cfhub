import { extensionRoot } from "../extensions.mjs";

export function mutateExtension({ action, opts, printer, fail, fsImpl, homeDir }) {
  if (action === "install" || action === "upgrade") {
    if (!opts.path) {
      fail("Missing --path to an extension directory");
      return;
    }
    const source = opts.path;
    const manifest = JSON.parse(fsImpl.readFileSync(`${source}/cf-extension.json`, "utf8"));
    if (!manifest.name || !manifest.version || !manifest.commands) {
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
