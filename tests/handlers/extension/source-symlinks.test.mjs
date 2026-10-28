import { jest } from "@jest/globals";
import { hasNoExtensionSymlinks } from "../../../src/handlers/extension/source-symlinks.mjs";

test("accepts regular extension source files and folders", () => {
  const fsImpl = {
    lstatSync: jest.fn((entry) => ({
      isSymbolicLink: () => false,
      isDirectory: () => entry === "/extension",
    })),
    readdirSync: jest.fn(() => ["manifest.json"]),
  };
  expect(hasNoExtensionSymlinks("/extension", fsImpl)).toBe(true);
  expect(fsImpl.lstatSync).toHaveBeenCalledTimes(2);
});

test("rejects nested symbolic links and unreadable source entries", () => {
  const fsImpl = {
    lstatSync: (entry) => ({
      isSymbolicLink: () => entry.endsWith("linked-file"),
      isDirectory: () => entry === "/extension",
    }),
    readdirSync: () => ["linked-file"],
  };
  expect(hasNoExtensionSymlinks("/extension", fsImpl)).toBe(false);
  expect(
    hasNoExtensionSymlinks("/extension", {
      lstatSync: () => {
        throw new Error("read failed");
      },
      readdirSync: jest.fn(),
    }),
  ).toBe(false);
});

test("rejects filesystems that cannot inspect symbolic links", () => {
  expect(hasNoExtensionSymlinks("/extension", {})).toBe(false);
  expect(hasNoExtensionSymlinks("/extension", { lstatSync: () => ({}) })).toBe(false);
  expect(
    hasNoExtensionSymlinks("/extension", {
      lstatSync: () => ({ isSymbolicLink: () => false, isDirectory: () => true }),
    }),
  ).toBe(false);
});
