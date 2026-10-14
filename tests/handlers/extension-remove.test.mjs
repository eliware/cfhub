import { jest } from "@jest/globals";
import { removeExtension } from "../../src/handlers/extension-remove.mjs";

test("requires a name and force before removal", () => {
  const fail = jest.fn();
  const base = { opts: {}, printer: { log: jest.fn() }, fail, fsImpl: {}, homeDir: "/home" };
  removeExtension(base);
  expect(fail).toHaveBeenCalledWith("Missing --name");
  removeExtension({ ...base, opts: { name: "demo" } });
  expect(fail).toHaveBeenCalledWith("Refusing extension removal without --force");
});

test("removes a named extension with force", () => {
  const fsImpl = { rmSync: jest.fn() };
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

test("rejects an unsafe name before removing an extension", () => {
  const fail = jest.fn();
  const fsImpl = { rmSync: jest.fn() };
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
