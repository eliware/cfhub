import { jest } from "@jest/globals";
import { upgradeExtension } from "../../src/handlers/extension-upgrade.mjs";

test("upgrade replaces an existing extension", () => {
  const fsImpl = {
    readFileSync: () => JSON.stringify({ name: "demo", version: "2", commands: {} }),
    mkdirSync: jest.fn(),
    existsSync: jest.fn(() => true),
    rmSync: jest.fn(),
    cpSync: jest.fn(),
  };
  const printer = { log: jest.fn() };
  upgradeExtension({
    opts: { path: "/source" },
    printer,
    fail: jest.fn(),
    fsImpl,
    homeDir: "/home",
  });
  expect(fsImpl.rmSync).toHaveBeenCalledWith(expect.stringContaining("demo"), {
    recursive: true,
    force: true,
  });
  expect(printer.log).toHaveBeenCalledWith("Upgraded extension demo");
});

test("upgrade requires an installed extension and valid input", () => {
  const fail = jest.fn();
  const base = { opts: { path: "/source" }, printer: { log: jest.fn() }, fail, homeDir: "/home" };
  upgradeExtension({ ...base, fsImpl: { readFileSync: () => "{}", mkdirSync: jest.fn() } });
  expect(fail).toHaveBeenCalledWith("Invalid cfhub extension manifest");
  upgradeExtension({
    ...base,
    fsImpl: {
      readFileSync: () => JSON.stringify({ name: "demo", version: "1", commands: {} }),
      mkdirSync: jest.fn(),
      existsSync: jest.fn(() => false),
    },
  });
  expect(fail).toHaveBeenCalledWith("Extension demo is not installed. Use install instead.");
});

test("upgrade requires a source path", () => {
  const fail = jest.fn();
  upgradeExtension({
    opts: {},
    printer: { log: jest.fn() },
    fail,
    fsImpl: {},
    homeDir: "/home",
  });
  expect(fail).toHaveBeenCalledWith("Missing --path to an extension directory");
});

test("refuses an upgrade manifest with a command path traversal", () => {
  const fail = jest.fn();
  const rmSync = jest.fn();
  upgradeExtension({
    opts: { path: "/source" },
    printer: { log: jest.fn() },
    fail,
    fsImpl: {
      readFileSync: () =>
        JSON.stringify({
          name: "demo",
          version: "1",
          commands: { demo: "../outside.mjs" },
        }),
      mkdirSync: jest.fn(),
      existsSync: jest.fn(() => true),
      rmSync,
    },
    homeDir: "/home",
  });
  expect(fail).toHaveBeenCalledWith("Invalid cfhub extension manifest");
  expect(rmSync).not.toHaveBeenCalled();
});
