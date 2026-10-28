import { jest } from "@jest/globals";
import path from "node:path";
import { loadExtensionSource } from "../../../src/handlers/extension/source.mjs";

const validManifest = { name: "demo", version: "1.0.0", commands: {} };

test("loads a valid extension source manifest", () => {
  const fsImpl = {
    readFileSync: jest.fn(() => JSON.stringify(validManifest)),
    lstatSync: () => ({ isSymbolicLink: () => false, isDirectory: () => false }),
    readdirSync: () => [],
  };
  expect(loadExtensionSource({ sourcePath: "/source", fsImpl, fail: jest.fn() })).toEqual({
    source: "/source",
    manifest: validManifest,
  });
});

test("loads command files inside the extension source", () => {
  const lstatSync = jest.fn((filePath) => ({
    isSymbolicLink: () => false,
    isDirectory: () => filePath.endsWith("commands"),
    isFile: () => filePath.endsWith("index.mjs"),
  }));
  const loaded = loadExtensionSource({
    sourcePath: "/source",
    fsImpl: {
      readFileSync: () =>
        JSON.stringify({
          name: "demo",
          version: "1.0.0",
          commands: { demo: "commands/index.mjs" },
        }),
      lstatSync,
      readdirSync: () => [],
    },
    fail: jest.fn(),
  });
  expect(loaded?.manifest.name).toBe("demo");
  expect(lstatSync).toHaveBeenCalledTimes(3);
});

test("reports a missing source path", () => {
  const fail = jest.fn();
  expect(loadExtensionSource({ fsImpl: {}, fail })).toBeNull();
  expect(fail).toHaveBeenCalledWith("Missing --path to an extension directory");
});

test("rejects a source when a command file is missing", () => {
  const fail = jest.fn();
  expect(
    loadExtensionSource({
      sourcePath: "/source",
      fsImpl: {
        readFileSync: () =>
          JSON.stringify({ name: "demo", version: "1.0.0", commands: { demo: "index.mjs" } }),
        lstatSync: (entryPath) => {
          if (entryPath === path.resolve("/source"))
            return { isSymbolicLink: () => false, isDirectory: () => false };
          throw new Error("missing file");
        },
        readdirSync: () => [],
      },
      fail,
    }),
  ).toBeNull();
  expect(fail).toHaveBeenCalledWith("Invalid cfhub extension manifest");
});

test("rejects symbolic links anywhere in the extension source", () => {
  const fail = jest.fn();
  const fsImpl = {
    readFileSync: () => JSON.stringify(validManifest),
    lstatSync: (entryPath) => ({
      isSymbolicLink: () => entryPath.endsWith("linked-file"),
      isDirectory: () => entryPath.endsWith("source"),
    }),
    readdirSync: () => ["linked-file"],
  };
  expect(loadExtensionSource({ sourcePath: "/source", fsImpl, fail })).toBeNull();
  expect(fail).toHaveBeenCalledWith("Extension source cannot contain symbolic links");
});
