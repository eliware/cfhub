import { jest } from "@jest/globals";
import { removeExtension } from "../../../src/handlers/extension/remove.mjs";

test("requires a name and force before removal", () => {
  const fail = jest.fn();
  const base = { opts: {}, printer: { log: jest.fn() }, fail, fsImpl: {}, homeDir: "/home" };
  removeExtension(base);
  expect(fail).toHaveBeenCalledWith("Missing --name");
  removeExtension({ ...base, opts: { name: "demo" } });
  expect(fail).toHaveBeenCalledWith("Refusing extension removal without --force");
});

test("removes a named extension with force", () => {
  const fsImpl = { lstatSync: jest.fn(() => ({ isSymbolicLink: () => false })), rmSync: jest.fn() };
  const printer = { log: jest.fn() };
  removeExtension({
    opts: { name: "demo", force: true },
    printer,
    fail: jest.fn(),
    fsImpl,
    homeDir: "/home",
  });
  expect(fsImpl.rmSync).toHaveBeenCalledWith(expect.stringContaining("demo"), {
    recursive: true,
    force: true,
  });
  expect(printer.log).toHaveBeenCalledWith("Removed extension demo");
});

test("refuses to remove an extension path that is a symbolic link", () => {
  const fail = jest.fn();
  const fsImpl = {
    lstatSync: jest.fn(() => ({ isSymbolicLink: () => true })),
    rmSync: jest.fn(),
  };
  removeExtension({
    opts: { name: "demo", force: true },
    printer: { log: jest.fn() },
    fail,
    fsImpl,
    homeDir: "/home",
  });
  expect(fail).toHaveBeenCalledWith("Refusing to remove a symbolic link");
  expect(fsImpl.rmSync).not.toHaveBeenCalled();
});

test("allows removal when the extension path is already missing", () => {
  const fsImpl = {
    lstatSync: jest.fn(() => {
      throw Object.assign(new Error("missing"), { code: "ENOENT" });
    }),
    rmSync: jest.fn(),
  };
  removeExtension({
    opts: { name: "demo", force: true },
    printer: { log: jest.fn() },
    fail: jest.fn(),
    fsImpl,
    homeDir: "/home",
  });
  expect(fsImpl.rmSync).toHaveBeenCalled();
});

test("propagates extension path inspection errors", () => {
  const inspectionError = Object.assign(new Error("access denied"), { code: "EACCES" });
  const fsImpl = {
    lstatSync: jest.fn(() => {
      throw inspectionError;
    }),
    rmSync: jest.fn(),
  };
  expect(() =>
    removeExtension({
      opts: { name: "demo", force: true },
      printer: { log: jest.fn() },
      fail: jest.fn(),
      fsImpl,
      homeDir: "/home",
    }),
  ).toThrow(inspectionError);
  expect(fsImpl.rmSync).not.toHaveBeenCalled();
});

test("rejects an unsafe name before removing an extension", () => {
  const fail = jest.fn();
  const fsImpl = { lstatSync: jest.fn(), rmSync: jest.fn() };
  removeExtension({
    opts: { name: "../outside", force: true },
    printer: { log: jest.fn() },
    fail,
    fsImpl,
    homeDir: "/home",
  });
  expect(fail).toHaveBeenCalledWith("Invalid extension name");
  expect(fsImpl.rmSync).not.toHaveBeenCalled();
});
