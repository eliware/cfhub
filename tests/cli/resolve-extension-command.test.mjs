import { jest } from "@jest/globals";
import { resolveExtensionCommand } from "../../src/cli/resolve-extension-command.mjs";

test("extension invocation builds its command context and output callbacks", async () => {
  const printer = { log: jest.fn(), error: jest.fn() };
  const loadBody = jest.fn(() => "body");
  const toJson = jest.fn();
  let context;
  const result = await resolveExtensionCommand({
    extensionManifest: { name: "sample" },
    resource: "sample",
    action: "run",
    opts: { output: "json" },
    printer,
    homeDir: "home",
    fsImpl: {},
    loadBody,
    loadCommand: async (...args) => {
      expect(args).toEqual([{ name: "sample" }, "sample", "home"]);
      return (value) => {
        context = value;
        return "handled";
      };
    },
    toJson,
  });
  expect(result).toEqual({ done: true, value: "handled" });
  expect(loadBody).toHaveBeenCalledWith({ output: "json" }, {});
  expect(context).toMatchObject({
    cf: null,
    action: "run",
    body: "body",
    outputJson: true,
  });
  context.toJsonOutput({ ok: true });
  expect(toJson).toHaveBeenCalledWith({ ok: true }, printer.log);
  expect(context.fail("bad")).toBeUndefined();
  expect(printer.error).toHaveBeenCalledWith("bad");
});

test("extension invocation reports a missing handler", async () => {
  const printer = { error: jest.fn() };
  const result = await resolveExtensionCommand({
    extensionManifest: {},
    resource: "sample",
    action: "run",
    opts: {},
    printer,
    homeDir: "home",
    fsImpl: {},
    loadBody: jest.fn(),
    loadCommand: async () => null,
  });
  expect(result).toEqual({ done: true, value: undefined });
  expect(printer.error).toHaveBeenCalledWith("Extension command is not loadable: sample");
});

test("extension invocation uses default command and JSON helpers", async () => {
  const printer = { log: jest.fn(), error: jest.fn() };
  const missing = await resolveExtensionCommand({
    extensionManifest: { name: "sample", commands: {} },
    resource: "missing",
    action: "run",
    opts: {},
    printer,
    homeDir: "home",
    fsImpl: {},
    loadBody: jest.fn(),
  });
  expect(missing.done).toBe(true);
  const handled = await resolveExtensionCommand({
    extensionManifest: { name: "sample" },
    resource: "sample",
    action: "run",
    opts: { json: true },
    printer,
    homeDir: "home",
    fsImpl: {},
    loadBody: jest.fn(),
    loadCommand: async (manifest, resource, homeDir) => {
      expect([manifest.name, resource, homeDir]).toEqual(["sample", "sample", "home"]);
      return (context) => {
        context.toJsonOutput({ ok: true });
        return "handled";
      };
    },
  });
  expect(handled.value).toBe("handled");
  expect(printer.log).toHaveBeenCalledWith(JSON.stringify({ ok: true }, null, 2));
});
