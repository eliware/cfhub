import { jest } from "@jest/globals";
import { installExtension } from "../../src/handlers/extension-install.mjs";

test("validates and installs an extension directory", () => {
  const fsImpl = {
    readFileSync: jest.fn(() => JSON.stringify({ name: "demo", version: "1.0.0", commands: {} })),
    mkdirSync: jest.fn(),
    rmSync: jest.fn(),
    cpSync: jest.fn(),
  };
  const printer = { log: jest.fn() };
  installExtension({
    action: "install",
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
    action: "upgrade",
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
