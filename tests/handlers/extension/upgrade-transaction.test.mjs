import { jest } from "@jest/globals";
import { replaceExtension } from "../../../src/handlers/extension/upgrade-transaction.mjs";

test("replaces an installed extension and cleans temporary directories", () => {
  let tempNumber = 0;
  const fsImpl = {
    readFileSync: () => JSON.stringify({ name: "demo", version: "2", commands: {} }),
    mkdirSync: jest.fn(),
    existsSync: jest.fn(() => true),
    mkdtempSync: jest.fn(() => `cfhub-temp-${++tempNumber}`),
    renameSync: jest.fn(),
    rmSync: jest.fn(),
    cpSync: jest.fn(),
  };
  expect(
    replaceExtension({
      source: "source",
      destination: "installed/demo",
      root: "installed",
      name: "demo",
      fsImpl,
    }),
  ).toBeUndefined();
  expect(fsImpl.renameSync).toHaveBeenCalledTimes(2);
  expect(fsImpl.rmSync).toHaveBeenCalledTimes(2);
});

test("returns cleanup failures from the transaction result", () => {
  let tempNumber = 0;
  const cleanupError = new Error("stage cleanup failed");
  const fsImpl = {
    readFileSync: () => JSON.stringify({ name: "demo", version: "2", commands: {} }),
    mkdirSync: jest.fn(),
    existsSync: jest.fn(() => true),
    mkdtempSync: jest.fn(() => `temp-${++tempNumber}`),
    renameSync: jest.fn(),
    rmSync: jest.fn().mockImplementationOnce(() => {
      throw cleanupError;
    }),
    cpSync: jest.fn(),
  };
  expect(
    replaceExtension({
      source: "source",
      destination: "installed/demo",
      root: "installed",
      name: "demo",
      fsImpl,
    }),
  ).toEqual({
    backupDestination: expect.stringContaining("demo"),
    cleanupErrors: [{ path: "temp-1", error: cleanupError }],
  });
});

test("restores the old extension when the staged upgrade cannot replace it", () => {
  let tempNumber = 0;
  const fsImpl = {
    readFileSync: () => JSON.stringify({ name: "demo", version: "2", commands: {} }),
    mkdirSync: jest.fn(),
    existsSync: jest.fn(() => true),
    mkdtempSync: jest.fn(() => `cfhub-temp-${++tempNumber}`),
    renameSync: jest
      .fn()
      .mockImplementationOnce(() => {})
      .mockImplementationOnce(() => {
        throw new Error("install failed");
      })
      .mockImplementationOnce(() => {}),
    rmSync: jest.fn(),
    cpSync: jest.fn(),
  };
  expect(() =>
    replaceExtension({
      source: "source",
      destination: "installed/demo",
      root: "installed",
      name: "demo",
      fsImpl,
    }),
  ).toThrow("install failed");
  expect(fsImpl.renameSync).toHaveBeenNthCalledWith(
    3,
    expect.stringContaining("cfhub-temp-2"),
    expect.stringContaining("demo"),
  );
  expect(fsImpl.rmSync).toHaveBeenCalledWith("cfhub-temp-2", { recursive: true, force: true });
});

test("keeps the backup when restoration fails", () => {
  let tempNumber = 0;
  const fsImpl = {
    readFileSync: () => JSON.stringify({ name: "demo", version: "2", commands: {} }),
    mkdirSync: jest.fn(),
    existsSync: jest.fn(() => true),
    mkdtempSync: jest.fn(() => `cfhub-temp-${++tempNumber}`),
    renameSync: jest
      .fn()
      .mockImplementationOnce(() => {})
      .mockImplementationOnce(() => {
        throw new Error("install failed");
      })
      .mockImplementationOnce(() => {
        throw new Error("restore failed");
      }),
    rmSync: jest.fn(),
    cpSync: jest.fn(),
  };
  expect(() =>
    replaceExtension({
      source: "source",
      destination: "installed/demo",
      root: "installed",
      name: "demo",
      fsImpl,
    }),
  ).toThrow(/Restore the backup at cfhub-temp-2[\\/]demo/);
  expect(fsImpl.rmSync).not.toHaveBeenCalledWith("cfhub-temp-2", { recursive: true, force: true });
});

test("removes the staging directory when backup setup fails", () => {
  const fsImpl = {
    mkdtempSync: jest
      .fn()
      .mockReturnValueOnce("stage-root")
      .mockImplementationOnce(() => {
        throw new Error("backup setup failed");
      }),
    rmSync: jest.fn(),
  };
  expect(() =>
    replaceExtension({
      source: "source",
      destination: "installed/demo",
      root: "installed",
      name: "demo",
      fsImpl,
    }),
  ).toThrow("backup setup failed");
  expect(fsImpl.rmSync).toHaveBeenCalledWith("stage-root", { recursive: true, force: true });
});

test("does not clean a staging directory when creation fails", () => {
  const fsImpl = {
    mkdtempSync: jest.fn(() => {
      throw new Error("staging setup failed");
    }),
    rmSync: jest.fn(),
  };
  expect(() =>
    replaceExtension({
      source: "source",
      destination: "installed/demo",
      root: "installed",
      name: "demo",
      fsImpl,
    }),
  ).toThrow("staging setup failed");
  expect(fsImpl.rmSync).not.toHaveBeenCalled();
});
