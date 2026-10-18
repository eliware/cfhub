import { jest } from "@jest/globals";
import {
  outputExtensionInfo,
  outputExtensionList,
} from "../../../src/handlers/extension/inspect-view.mjs";

const manifest = { name: "hello", version: "1.0.0", commands: {} };

test("outputs an extension list as JSON or a table", () => {
  const toJsonOutput = jest.fn();
  outputExtensionList({
    manifests: [manifest],
    outputJson: true,
    toJsonOutput,
    printer: { log: jest.fn() },
  });
  expect(toJsonOutput).toHaveBeenCalledWith([manifest]);
  const log = jest.fn();
  outputExtensionList({
    manifests: [manifest],
    outputJson: false,
    printer: { log },
  });
  expect(log).toHaveBeenCalledWith(expect.stringContaining("hello"));
});

test("outputs extension details as JSON or text", () => {
  const toJsonOutput = jest.fn();
  outputExtensionInfo({ manifest, outputJson: true, toJsonOutput });
  expect(toJsonOutput).toHaveBeenCalledWith(manifest);
  const log = jest.fn();
  outputExtensionInfo({ manifest, outputJson: false, printer: { log } });
  expect(log).toHaveBeenCalledWith("hello 1.0.0\n(no description)");
});
