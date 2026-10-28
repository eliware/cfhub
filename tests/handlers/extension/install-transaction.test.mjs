import { jest } from "@jest/globals";
import { installExtensionTransaction } from "../../../src/handlers/extension/install-transaction.mjs";

test("copies an extension to staging and moves it into place", () => {
  const fsImpl = {
    mkdtempSync: jest.fn(() => "/extensions/.stage"),
    cpSync: jest.fn(),
    renameSync: jest.fn(),
    rmSync: jest.fn(),
  };
  expect(
    installExtensionTransaction({
      source: "/source",
      destination: "/extensions/demo",
      root: "/extensions",
      name: "demo",
      fsImpl,
    }),
  ).toEqual([]);
  expect(fsImpl.cpSync).toHaveBeenCalledWith("/source", expect.stringContaining("demo"), {
    recursive: true,
  });
  expect(fsImpl.renameSync).toHaveBeenCalledWith(
    expect.stringContaining("demo"),
    "/extensions/demo",
  );
  expect(fsImpl.rmSync).toHaveBeenCalledWith("/extensions/.stage", {
    recursive: true,
    force: true,
  });
});

test("cleans staging after a copy failure and leaves the destination untouched", () => {
  const copyError = new Error("copy failed");
  const fsImpl = {
    mkdtempSync: jest.fn(() => "/extensions/.stage"),
    cpSync: jest.fn(() => {
      throw copyError;
    }),
    renameSync: jest.fn(),
    rmSync: jest.fn(),
  };
  expect(() =>
    installExtensionTransaction({
      source: "/source",
      destination: "/extensions/demo",
      root: "/extensions",
      name: "demo",
      fsImpl,
    }),
  ).toThrow(copyError);
  expect(fsImpl.renameSync).not.toHaveBeenCalled();
  expect(fsImpl.rmSync).toHaveBeenCalledWith("/extensions/.stage", {
    recursive: true,
    force: true,
  });
});
