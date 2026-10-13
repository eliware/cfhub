import { discoverExtensions } from "../extensions.mjs";
import { printTable } from "../output.mjs";

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
    return outputJson
      ? toJsonOutput(manifests)
      : printTable(
          ["NAME", "VERSION"],
          manifests.map((manifest) => [manifest.name, manifest.version]),
          printer.log,
        );
  if (!opts.name) {
    fail("Missing --name");
    return;
  }
  const manifest = manifests.find((item) => item.name === opts.name);
  if (!manifest) {
    fail(`Unknown extension: ${opts.name}`);
    return;
  }
  return outputJson
    ? toJsonOutput(manifest)
    : printer.log(
        `${manifest.name} ${manifest.version}\n${manifest.description || "(no description)"}`,
      );
}
