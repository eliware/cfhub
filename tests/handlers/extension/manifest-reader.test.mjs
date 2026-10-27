import { jest } from "@jest/globals";
import { readExtensionManifest } from "../../../src/handlers/extension/manifest-reader.mjs";

const validManifest = { name: "demo", version: "1.0.0", commands: {} };

test("reads a valid extension manifest", () => {
  const readFileSync = jest.fn(() => JSON.stringify(validManifest));
  expect(readExtensionManifest("/source", { readFileSync }, jest.fn())).toEqual(validManifest);
  expect(readFileSync).toHaveBeenCalledWith("/source/cf-extension.json", "utf8");
});

test.each([
  ["invalid JSON", "{"],
  ["invalid manifest fields", "{}"],
  ["absolute command path", JSON.stringify({ ...validManifest, commands: { run: "/run.mjs" } })],
  ["command path traversal", JSON.stringify({ ...validManifest, commands: { run: "../run.mjs" } })],
])("rejects a manifest with %s", (_reason, contents) => {
  const fail = jest.fn();
  expect(readExtensionManifest("/source", { readFileSync: () => contents }, fail)).toBeNull();
  expect(fail).toHaveBeenCalledWith("Invalid cfhub extension manifest");
});
