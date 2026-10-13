import { jest } from "@jest/globals";
import { inspectExtension } from "../../src/handlers/extension-inspect.mjs";

const fsImpl = {
  existsSync: () => true,
  readdirSync: () => [{ name: "hello", isDirectory: () => true }],
  readFileSync: () => JSON.stringify({ name: "hello", version: "1.0.0", commands: {} }),
};

test("extension inspection prints or returns the extension list", () => {
  const toJsonOutput = jest.fn();
  const printer = { log: jest.fn() };
  inspectExtension({
    action: "list",
    opts: {},
    outputJson: true,
    toJsonOutput,
    printer,
    fsImpl,
    homeDir: "/workspace",
  });
  expect(toJsonOutput).toHaveBeenCalledWith([{ name: "hello", version: "1.0.0", commands: {} }]);
});

test("extension inspection reports a missing or unknown name", () => {
  const fail = jest.fn();
  const base = {
    action: "info",
    outputJson: false,
    printer: { log: jest.fn() },
    fsImpl,
    homeDir: "/workspace",
    fail,
  };
  inspectExtension({ ...base, opts: {} });
  inspectExtension({ ...base, opts: { name: "missing" } });
  expect(fail).toHaveBeenNthCalledWith(1, "Missing --name");
  expect(fail).toHaveBeenNthCalledWith(2, "Unknown extension: missing");
});
