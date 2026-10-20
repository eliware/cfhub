import { jest } from "@jest/globals";
import path from "node:path";
import {
  copyExtensionToStage,
  createExtensionStagingRoot,
} from "../../../src/handlers/extension/staging.mjs";

test("creates a staging directory", () => {
  const fsImpl = { mkdtempSync: jest.fn(() => "/root/.cfhub-extension-stage-a") };
  expect(createExtensionStagingRoot("/root", fsImpl)).toBe("/root/.cfhub-extension-stage-a");
  expect(fsImpl.mkdtempSync).toHaveBeenCalledWith(path.join("/root", ".cfhub-extension-stage-"));
});

test("copies the extension source into its staging directory", () => {
  const fsImpl = { cpSync: jest.fn() };
  expect(
    copyExtensionToStage({ source: "/source", stagingRoot: "/stage", name: "demo", fsImpl }),
  ).toBe(path.join("/stage", "demo"));
  expect(fsImpl.cpSync).toHaveBeenCalledWith("/source", path.join("/stage", "demo"), {
    recursive: true,
  });
});

test("reports source copy failures", () => {
  const error = new Error("copy failed");
  const fsImpl = {
    cpSync: jest.fn(() => {
      throw error;
    }),
  };
  expect(() =>
    copyExtensionToStage({ source: "/source", stagingRoot: "/stage", name: "demo", fsImpl }),
  ).toThrow(error);
});
