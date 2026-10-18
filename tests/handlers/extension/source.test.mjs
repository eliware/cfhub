import { jest } from "@jest/globals";
import {
  extensionPathsOverlap,
  loadExtensionSource,
} from "../../../src/handlers/extension/source.mjs";

test("detects equal, nested, and separate extension paths", () => {
  expect(extensionPathsOverlap("C:/extensions/demo", "C:/extensions/demo")).toBe(true);
  expect(extensionPathsOverlap("C:/extensions/demo/source", "C:/extensions/demo")).toBe(true);
  expect(extensionPathsOverlap("C:/source", "C:/extensions/demo")).toBe(false);
  expect(extensionPathsOverlap("C:/source", "C:/extensions/demo", {})).toBe(false);
  expect(
    extensionPathsOverlap("C:/source", "C:/extensions/demo", {
      realpathSync: () => {
        throw new Error("path is not linked");
      },
    }),
  ).toBe(false);
  expect(
    extensionPathsOverlap("C:/source-link", "C:/extensions/demo", {
      realpathSync: (value) =>
        value.endsWith("source-link")
          ? value.replace("source-link", "extensions/demo/source")
          : value,
    }),
  ).toBe(true);
});

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
  expect(
    loadExtensionSource({
      sourcePath: "source",
      fsImpl: { readFileSync: () => "{" },
      fail,
    }),
  ).toBeNull();
  expect(fail).toHaveBeenLastCalledWith("Invalid cfhub extension manifest");
});

test("rejects command paths without a source file", () => {
  const fail = jest.fn();
  const loaded = loadExtensionSource({
    sourcePath: "/source",
    fsImpl: {
      readFileSync: () =>
        JSON.stringify({ name: "demo", version: "1.0.0", commands: { demo: "index.mjs" } }),
      lstatSync: jest.fn(() => {
        throw new Error("missing file");
      }),
    },
    fail,
  });
  expect(loaded).toBeNull();
  expect(fail).toHaveBeenCalledWith("Invalid cfhub extension manifest");
});

test("rejects command files inside a symbolic link", () => {
  const fail = jest.fn();
  const lstatSync = jest.fn(() => ({ isSymbolicLink: () => true, isFile: () => false }));
  const loaded = loadExtensionSource({
    sourcePath: "/source",
    fsImpl: {
      readFileSync: () =>
        JSON.stringify({ name: "demo", version: "1.0.0", commands: { demo: "linked/index.mjs" } }),
      lstatSync,
    },
    fail,
  });
  expect(loaded).toBeNull();
  expect(lstatSync.mock.calls[0][0]).toMatch(/source[\\/]linked$/);
  expect(fail).toHaveBeenCalledWith("Invalid cfhub extension manifest");
});

test("rejects command paths that end in a directory", () => {
  const fail = jest.fn();
  const loaded = loadExtensionSource({
    sourcePath: "source",
    fsImpl: {
      readFileSync: () =>
        JSON.stringify({ name: "demo", version: "1.0.0", commands: { demo: "folder" } }),
      lstatSync: () => ({ isSymbolicLink: () => false, isFile: () => false }),
    },
    fail,
  });
  expect(loaded).toBeNull();
  expect(fail).toHaveBeenCalledWith("Invalid cfhub extension manifest");
});

test("rejects command paths that resolve outside the source directory", () => {
  const fail = jest.fn();
  const loaded = loadExtensionSource({
    sourcePath: "/source",
    fsImpl: {
      readFileSync: () =>
        JSON.stringify({ name: "demo", version: "1.0.0", commands: { demo: "/outside.mjs" } }),
    },
    fail,
  });
  expect(loaded).toBeNull();
  expect(fail).toHaveBeenCalledWith("Invalid cfhub extension manifest");
});
