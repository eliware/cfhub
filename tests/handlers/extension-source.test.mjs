import { jest } from "@jest/globals";
import { loadExtensionSource } from "../../src/handlers/extension-source.mjs";

const validManifest = { name: "demo", version: "1.0.0", commands: {} };

test("loads a valid extension source manifest", () => {
  const fsImpl = { readFileSync: jest.fn(() => JSON.stringify(validManifest)) };
  expect(loadExtensionSource({ sourcePath: "/source", fsImpl, fail: jest.fn() })).toEqual({
    source: "/source",
    manifest: validManifest,
  });
  expect(fsImpl.readFileSync).toHaveBeenCalledWith("/source/cf-extension.json", "utf8");
});

test("reports a missing path or invalid manifest", () => {
  const fail = jest.fn();
  expect(loadExtensionSource({ fsImpl: {}, fail })).toBeNull();
  expect(fail).toHaveBeenCalledWith("Missing --path to an extension directory");
  expect(
    loadExtensionSource({
      sourcePath: "/source",
      fsImpl: { readFileSync: () => "{}" },
      fail,
    }),
  ).toBeNull();
  expect(fail).toHaveBeenLastCalledWith("Invalid cfhub extension manifest");
});
