import { jest } from "@jest/globals";
import { cleanupExtension } from "../../../src/handlers/extension/cleanup.mjs";

test("cleans staging and backup paths after a successful install", () => {
  const fsImpl = { rmSync: jest.fn() };
  expect(
    cleanupExtension({
      stagingRoot: "stage",
      backupRoot: "backup",
      originalMoved: false,
      installedSuccessfully: true,
      fsImpl,
    }),
  ).toEqual([]);
  expect(fsImpl.rmSync).toHaveBeenNthCalledWith(1, "stage", { recursive: true, force: true });
  expect(fsImpl.rmSync).toHaveBeenNthCalledWith(2, "backup", { recursive: true, force: true });
});

test("collects staging cleanup errors and still cleans the backup", () => {
  const stageError = new Error("stage cleanup failed");
  const fsImpl = {
    rmSync: jest.fn().mockImplementationOnce(() => {
      throw stageError;
    }),
  };
  expect(
    cleanupExtension({
      stagingRoot: "stage",
      backupRoot: "backup",
      originalMoved: false,
      installedSuccessfully: true,
      fsImpl,
    }),
  ).toEqual([{ path: "stage", error: stageError }]);
  expect(fsImpl.rmSync).toHaveBeenCalledTimes(2);
});

test("collects backup cleanup errors after cleaning staging", () => {
  const backupError = new Error("backup cleanup failed");
  const fsImpl = {
    rmSync: jest
      .fn()
      .mockImplementationOnce(() => {})
      .mockImplementationOnce(() => {
        throw backupError;
      }),
  };
  expect(
    cleanupExtension({
      stagingRoot: "stage",
      backupRoot: "backup",
      originalMoved: false,
      installedSuccessfully: true,
      fsImpl,
    }),
  ).toEqual([{ path: "backup", error: backupError }]);
});

test("throws cleanup errors when an install did not succeed", () => {
  const fsImpl = {
    rmSync: jest.fn().mockImplementationOnce(() => {
      throw new Error("stage cleanup failed");
    }),
  };
  expect(() =>
    cleanupExtension({
      stagingRoot: "stage",
      backupRoot: "backup",
      originalMoved: false,
      installedSuccessfully: false,
      fsImpl,
    }),
  ).toThrow("stage cleanup failed");
  expect(fsImpl.rmSync).toHaveBeenCalledTimes(2);
});

test("skips absent paths and a backup that still holds the original", () => {
  const fsImpl = { rmSync: jest.fn() };
  expect(
    cleanupExtension({
      stagingRoot: undefined,
      backupRoot: "backup",
      originalMoved: true,
      installedSuccessfully: false,
      fsImpl,
    }),
  ).toEqual([]);
  expect(fsImpl.rmSync).not.toHaveBeenCalled();
});
