import { discoverExtensions } from "../../extensions.mjs";
import { outputExtensionInfo, outputExtensionList } from "./inspect-view.mjs";

export function inspectExtension({
  action,
  opts,
  outputJson,
  printer,
  toJsonOutput,
  fail,
  fsImpl,
  homeDir,
}) {
  const manifests = discoverExtensions(homeDir, fsImpl);
  if (action === "list")
    return outputExtensionList({ manifests, outputJson, toJsonOutput, printer });
  if (!opts.name) {
    fail("Missing --name");
    return;
  }
  const manifest = manifests.find((item) => item.name === opts.name);
  if (!manifest) {
    fail(`Unknown extension: ${opts.name}`);
    return;
  }
  return outputExtensionInfo({ manifest, outputJson, toJsonOutput, printer });
}
