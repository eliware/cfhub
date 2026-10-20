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

test("extension handler reports unknown actions", () => {
  const fail = jest.fn();
  handleExtension({ action: "unknown", opts: {}, fail });
  expect(fail).toHaveBeenCalledWith("Unknown extension action: unknown");
});
