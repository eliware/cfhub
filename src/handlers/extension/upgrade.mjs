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
  if (typeof fsImpl.lstatSync === "function") {
    try {
      if (fsImpl.lstatSync(destination).isSymbolicLink()) {
        fail("Refusing to upgrade a symbolic link");
        return;
      }
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  fsImpl.mkdirSync(root, { recursive: true });
  if (typeof fsImpl.existsSync !== "function" || !fsImpl.existsSync(destination)) {
    fail(`Extension ${manifest.name} is not installed. Run the install command.`);
    return;
  }
  const result = replaceExtension({ source, destination, root, name: manifest.name, fsImpl });
  const message = printer.log(`Upgraded extension ${manifest.name}`);
  result?.cleanupErrors.forEach(({ path: cleanupPath, error }) => {
    const backupMessage = result.backupRetained
      ? ` The previous extension remains at ${result.backupDestination}.`
      : "";
    printer.error(
      `Upgrade completed, but cleanup failed for ${cleanupPath}: ${error.message}.${backupMessage}`,
    );
  });
  return message;
}
