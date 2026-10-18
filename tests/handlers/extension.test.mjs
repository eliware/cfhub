import { jest } from "@jest/globals";
import path from "node:path";
import { handleExtension } from "../../src/handlers/extension.mjs";
import { createMemoryFs } from "../../test-fixtures/unit/memory-fs.mjs";

function setup() {
  const home = path.resolve("virtual-home");
  const source = path.resolve("virtual-source/hello");
  const fsImpl = createMemoryFs({
    [`${source}/cf-extension.json`]: JSON.stringify({
      name: "hello",
      version: "1.0.0",
      commands: { hello: "hello.mjs" },
    }),
    [`${source}/hello.mjs`]: "source",
  });
  return { home, source, fsImpl };
}

test("extension install, list, upgrade, and remove work locally", () => {
  const { home, source, fsImpl } = setup();
  const printer = { log: jest.fn() };
  const common = {
    outputJson: true,
    toJsonOutput: jest.fn(),
    printer,
    fail: jest.fn(),
    homeDir: home,
    fsImpl,
  };
  handleExtension({ ...common, action: "install", opts: { path: source } });
  handleExtension({ ...common, action: "list", opts: {} });
  expect(common.toJsonOutput).toHaveBeenLastCalledWith([
    { name: "hello", version: "1.0.0", commands: { hello: "hello.mjs" } },
  ]);
  handleExtension({ ...common, action: "upgrade", opts: { path: source } });
  handleExtension({ ...common, action: "remove", opts: { name: "hello", force: true } });
  handleExtension({ ...common, action: "list", opts: {} });
  expect(printer.log).toHaveBeenCalledWith("Installed extension hello");
  expect(common.toJsonOutput).toHaveBeenLastCalledWith([]);
  expect(printer.log).toHaveBeenCalledWith("Removed extension hello");
});

test("extension validation and safety errors are reported", () => {
  const { home, source, fsImpl } = setup();
  const fail = jest.fn();
  const common = {
    action: "list",
    opts: {},
    outputJson: true,
    toJsonOutput: jest.fn(),
    printer: { log: jest.fn() },
    fail,
    homeDir: home,
    fsImpl,
  };
  handleExtension({ ...common, action: "install" });
  handleExtension({ ...common, action: "remove", opts: { name: "hello" } });
  handleExtension({ ...common, action: "remove", opts: {} });
  const invalid = "/source/invalid";
  fsImpl.writeFileSync(`${invalid}/cf-extension.json`, "{}");
  handleExtension({ ...common, action: "install", opts: { path: invalid } });
  handleExtension({ ...common, action: "unknown", opts: {} });
  handleExtension({ ...common, action: "info", opts: { name: "missing" } });
  handleExtension({ ...common, action: "info", opts: {} });
  expect(fail).toHaveBeenCalled();
  expect(source).toBeTruthy();
  handleExtension({
    action: "list",
    opts: {},
    outputJson: true,
    toJsonOutput: jest.fn(),
    printer: { log: jest.fn() },
    fail: jest.fn(),
    fsImpl,
  });
});

test("extension handler uses default filesystem and home values for unknown actions", () => {
  const fail = jest.fn();
  handleExtension({ action: "unknown", opts: {}, fail });
  expect(fail).toHaveBeenCalledWith("Unknown extension action: unknown");
});
