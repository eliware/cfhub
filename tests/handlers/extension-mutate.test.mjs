import { jest } from "@jest/globals";
import { mutateExtension } from "../../src/handlers/extension-mutate.mjs";

test("extension mutation installs a valid extension", () => {
  const fsImpl = {
    readFileSync: () => JSON.stringify({ name: "hello", version: "1.0.0", commands: {} }),
    mkdirSync: jest.fn(),
    rmSync: jest.fn(),
    cpSync: jest.fn(),
  };
  const printer = { log: jest.fn() };
  mutateExtension({
    action: "install",
    opts: { path: "/workspace/src/hello" },
    printer,
    fail: jest.fn(),
    fsImpl,
    homeDir: "/workspace",
  });
  expect(fsImpl.cpSync).toHaveBeenCalledWith(
    "/workspace/src/hello",
    "/workspace/.config/cfhub/extensions/hello",
    { recursive: true },
  );
  expect(printer.log).toHaveBeenCalledWith("Installed extension hello");
});

test("extension mutation requires force before removal", () => {
  const fsImpl = { rmSync: jest.fn() };
  const fail = jest.fn();
  mutateExtension({
    action: "remove",
    opts: { name: "hello" },
    printer: { log: jest.fn() },
    fail,
    fsImpl,
    homeDir: "/workspace",
  });
  expect(fail).toHaveBeenCalledWith("Refusing extension removal without --force");
  expect(fsImpl.rmSync).not.toHaveBeenCalled();
});
