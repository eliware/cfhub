import { jest } from "@jest/globals";
import { loadExtensionSource } from "../../../src/handlers/extension/source.mjs";

const validManifest = { name: "demo", version: "1.0.0", commands: {} };

test("loads a valid extension source manifest", () => {
  const fsImpl = { readFileSync: jest.fn(() => JSON.stringify(validManifest)) };
  expect(loadExtensionSource({ sourcePath: "/source", fsImpl, fail: jest.fn() })).toEqual({
    source: "/source",
    manifest: validManifest,
  });
});

test("loads command files inside the extension source", () => {
  const lstatSync = jest.fn((filePath) => ({
    isSymbolicLink: () => false,
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
    },
    fail: jest.fn(),
  });
  expect(loaded?.manifest.name).toBe("demo");
  expect(lstatSync).toHaveBeenCalledTimes(2);
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
        lstatSync: () => {
          throw new Error("missing file");
        },
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
