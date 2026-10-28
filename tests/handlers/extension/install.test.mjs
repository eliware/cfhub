import { jest } from "@jest/globals";
import { installExtension } from "../../../src/handlers/extension/install.mjs";

test("validates and installs an extension directory", () => {
  const fsImpl = {
    readFileSync: jest.fn(() => JSON.stringify({ name: "demo", version: "1.0.0", commands: {} })),
    mkdirSync: jest.fn(),
    existsSync: jest.fn(() => false),
    cpSync: jest.fn(),
  };
  const printer = { log: jest.fn() };
  installExtension({
    opts: { path: "/source" },
    printer,
    fail: jest.fn(),
    fsImpl,
    homeDir: "/home",
  });
  expect(fsImpl.cpSync).toHaveBeenCalledWith("/source", expect.stringContaining("demo"), {
    recursive: true,
  });
  expect(printer.log).toHaveBeenCalledWith("Installed extension demo");
});

test("reports missing or invalid extension manifests", () => {
  const fail = jest.fn();
  const base = {
    printer: { log: jest.fn() },
    fail,
    fsImpl: {},
    homeDir: "/home",
  };
  installExtension({ ...base, opts: {} });
  expect(fail).toHaveBeenCalledWith("Missing --path to an extension directory");
  installExtension({
    ...base,
    opts: { path: "/source" },
    fsImpl: { readFileSync: () => JSON.stringify({ name: "bad name" }) },
  });
  expect(fail).toHaveBeenCalledWith("Invalid cfhub extension manifest");
});

test("refuses to replace an installed extension", () => {
  const fail = jest.fn();
  const fsImpl = {
    readFileSync: () => JSON.stringify({ name: "demo", version: "1", commands: {} }),
    mkdirSync: jest.fn(),
    existsSync: jest.fn(() => true),
    cpSync: jest.fn(),
  };
  installExtension({
    opts: { path: "/source" },
    printer: { log: jest.fn() },
    fail,
    fsImpl,
    homeDir: "/home",
  });
  expect(fail).toHaveBeenCalledWith("Extension demo is installed. Run the upgrade command.");
  expect(fsImpl.cpSync).not.toHaveBeenCalled();
});

test("refuses an extension name that is unsafe on Windows", () => {
  const fail = jest.fn();
  const cpSync = jest.fn();
  installExtension({
    opts: { path: "source" },
    printer: { log: jest.fn() },
    fail,
    fsImpl: {
      readFileSync: () => JSON.stringify({ name: "C:drive", version: "1", commands: {} }),
      mkdirSync: jest.fn(),
      cpSync,
    },
    homeDir: "home",
  });
  expect(fail).toHaveBeenCalledWith("Invalid cfhub extension manifest");
  expect(cpSync).not.toHaveBeenCalled();
});

test("refuses an extension when its command file is missing", () => {
  const fail = jest.fn();
  const cpSync = jest.fn();
  installExtension({
    opts: { path: "/source" },
    printer: { log: jest.fn() },
    fail,
    fsImpl: {
      readFileSync: () =>
        JSON.stringify({ name: "demo", version: "1", commands: { demo: "index.mjs" } }),
      lstatSync: jest.fn(() => {
        throw new Error("missing file");
      }),
      mkdirSync: jest.fn(),
      cpSync,
    },
    homeDir: "/home",
  });
  expect(fail).toHaveBeenCalledWith("Invalid cfhub extension manifest");
  expect(cpSync).not.toHaveBeenCalled();
});
