import { printTable } from "../output-table.mjs";

export function outputExtensionList({ manifests, outputJson, toJsonOutput, printer }) {
  return outputJson
    ? toJsonOutput(manifests)
    : printTable(
        ["NAME", "VERSION"],
        manifests.map((manifest) => [manifest.name, manifest.version]),
        printer.log,
      );
}

export function outputExtensionInfo({ manifest, outputJson, toJsonOutput, printer }) {
  return outputJson
    ? toJsonOutput(manifest)
    : printer.log(
        `${manifest.name} ${manifest.version}\n${manifest.description || "(no description)"}`,
      );
}
