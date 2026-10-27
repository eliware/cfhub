import { jest } from "@jest/globals";
import os from "node:os";

const fsMock = { readFileSync: jest.fn() };
jest.unstable_mockModule("node:fs", () => fsMock);
const { createCliDependencies } = await import("../../src/cli/dependencies.mjs");

test("selects default CLI dependencies", () => {
  const dependencies = createCliDependencies();
  expect(dependencies.argv).toEqual(process.argv.slice(2));
  expect(dependencies.env).toBe(process.env);
  expect(dependencies.printer).toBe(console);
  expect(dependencies.fsImpl.readFileSync).toBe(fsMock.readFileSync);
  expect(dependencies.projectRoot).toBe(process.cwd());
  expect(dependencies.homeDir).toBe(os.homedir());
  expect(dependencies.handlers).toEqual({});
  expect(dependencies.cfFactory).toEqual(expect.any(Function));
  expect(dependencies.loadEnv).toEqual(expect.any(Function));
  expect(dependencies.exit).toEqual(expect.any(Function));
  expect(dependencies.updateCheck).toEqual(expect.any(Function));
});

test("preserves injected CLI dependencies", () => {
  const options = {
    argv: [],
    env: {},
    cfFactory: jest.fn(),
    loadEnv: jest.fn(),
    printer: {},
    fsImpl: {},
    handlers: { zones: jest.fn() },
    projectRoot: "project",
    homeDir: "home",
    exit: jest.fn(),
    updateCheck: jest.fn(),
    loadCommand: jest.fn(),
  };
  expect(createCliDependencies(options)).toEqual(options);
});
