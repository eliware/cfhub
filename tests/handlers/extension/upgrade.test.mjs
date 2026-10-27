import { jest } from "@jest/globals";
import path from "node:path";
import { upgradeExtension } from "../../../src/handlers/extension/upgrade.mjs";

test("upgrade replaces an existing extension", () => {
  let tempNumber = 0;
  const fsImpl = {
    readFileSync: () => JSON.stringify({ name: "demo", version: "2", commands: {} }),
    mkdirSync: jest.fn(),
    existsSync: jest.fn(() => true),
    rmSync: jest.fn(),
    mkdtempSync: jest.fn(() => `cfhub-temp-${++tempNumber}`),
    renameSync: jest.fn(),
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
  expect(fsImpl.cpSync).toHaveBeenCalledWith("/source", expect.stringContaining("cfhub-temp-1"), {
    recursive: true,
  });
  expect(fsImpl.renameSync).toHaveBeenNthCalledWith(
    1,
    expect.stringContaining("demo"),
    expect.stringContaining("cfhub-temp-2"),
  );
  expect(fsImpl.renameSync).toHaveBeenNthCalledWith(
    2,
    expect.stringContaining("cfhub-temp-1"),
    expect.stringContaining("demo"),
  );
  expect(printer.log).toHaveBeenCalledWith("Upgraded extension demo");
});

test("reports upgrade success when backup cleanup fails", () => {
  let tempNumber = 0;
  const cleanupError = new Error("backup cleanup failed");
  const fsImpl = {
    readFileSync: () => JSON.stringify({ name: "demo", version: "2", commands: {} }),
    mkdirSync: jest.fn(),
    existsSync: jest.fn(() => true),
    mkdtempSync: jest.fn(() => `cfhub-temp-${++tempNumber}`),
    renameSync: jest.fn(),
    cpSync: jest.fn(),
    rmSync: jest
      .fn()
      .mockImplementationOnce(() => {})
      .mockImplementationOnce(() => {
        throw cleanupError;
      }),
  };
  const printer = { log: jest.fn(), error: jest.fn() };
  upgradeExtension({
    opts: { path: "/source" },
    printer,
    fail: jest.fn(),
    fsImpl,
    homeDir: "/home",
  });
  expect(fsImpl.renameSync).toHaveBeenNthCalledWith(
    2,
    expect.stringContaining("cfhub-temp-1"),
    expect.stringContaining("demo"),
  );
  expect(printer.log).toHaveBeenCalledWith("Upgraded extension demo");
  expect(printer.error).toHaveBeenCalledWith(
    expect.stringContaining("Upgrade completed, but cleanup failed"),
  );
});

test("keeps the installed extension when staging the new extension fails", () => {
  let tempNumber = 0;
  const fsImpl = {
    readFileSync: () => JSON.stringify({ name: "demo", version: "2", commands: {} }),
    mkdirSync: jest.fn(),
    existsSync: jest.fn(() => true),
    mkdtempSync: jest.fn(() => `cfhub-temp-${++tempNumber}`),
    renameSync: jest.fn(),
    rmSync: jest.fn(),
    cpSync: jest.fn(() => {
      throw new Error("copy failed");
    }),
  };
  const fail = jest.fn();
  expect(() =>
    upgradeExtension({
      opts: { path: "/source" },
      printer: { log: jest.fn() },
      fail,
      fsImpl,
      homeDir: "/home",
    }),
  ).toThrow("copy failed");
  expect(fsImpl.renameSync).not.toHaveBeenCalled();
  expect(fsImpl.rmSync).toHaveBeenCalledWith("cfhub-temp-1", { recursive: true, force: true });
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
  expect(fail).toHaveBeenCalledWith("Extension demo is not installed. Run the install command.");
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

test("refuses an extension name that is unsafe on Windows", () => {
  const fail = jest.fn();
  const rmSync = jest.fn();
  upgradeExtension({
    opts: { path: "source" },
    printer: { log: jest.fn() },
    fail,
    fsImpl: {
      readFileSync: () => JSON.stringify({ name: "C:drive", version: "1", commands: {} }),
      mkdirSync: jest.fn(),
      rmSync,
    },
    homeDir: "home",
  });
  expect(fail).toHaveBeenCalledWith("Invalid cfhub extension manifest");
  expect(rmSync).not.toHaveBeenCalled();
});

test("refuses an upgrade source inside its installation destination", () => {
  const homeDir = path.join("/home", "cfhub-upgrade-test");
  const fail = jest.fn();
  const copy = jest.fn();
  const fsImpl = {
    readFileSync: () => JSON.stringify({ name: "demo", version: "2", commands: {} }),
    mkdirSync: jest.fn(),
    existsSync: jest.fn(() => true),
    cpSync: copy,
    rmSync: jest.fn(),
  };
  upgradeExtension({
    opts: { path: path.join(homeDir, ".config", "cfhub", "extensions", "demo", "source") },
    printer: { log: jest.fn() },
    fail,
    fsImpl,
    homeDir,
  });
  expect(fail).toHaveBeenCalledWith("Extension source must not overlap its install destination");
  expect(copy).not.toHaveBeenCalled();
});
