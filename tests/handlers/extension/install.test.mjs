import { jest } from "@jest/globals";
import { installExtension } from "../../../src/handlers/extension/install.mjs";

test("validates and installs an extension directory", () => {
  const fsImpl = {
    readFileSync: jest.fn(() => JSON.stringify({ name: "demo", version: "1.0.0", commands: {} })),
    mkdirSync: jest.fn(),
    existsSync: jest.fn(() => false),
    mkdtempSync: jest.fn(() => "/tmp/cfhub-home/extensions/.stage"),
    cpSync: jest.fn(),
    renameSync: jest.fn(),
    rmSync: jest.fn(() => {
      throw new Error("cleanup failed");
    }),
  };
  const printer = { log: jest.fn(), error: jest.fn() };
  installExtension({
    opts: { path: "/source" },
    printer,
    fail: jest.fn(),
    fsImpl,
    homeDir: "/tmp/cfhub-home",
  });
  expect(fsImpl.cpSync).toHaveBeenCalledWith("/source", expect.stringContaining("demo"), {
    recursive: true,
  });
  expect(fsImpl.renameSync).toHaveBeenCalledWith(
    expect.stringContaining("demo"),
    expect.stringContaining("demo"),
  );
  expect(printer.log).toHaveBeenCalledWith("Installed extension demo");
  expect(printer.error).toHaveBeenCalledWith(
    expect.stringContaining("Install completed, but cleanup failed"),
  );
});

test("reports missing or invalid extension manifests", () => {
  const fail = jest.fn();
  const base = {
    printer: { log: jest.fn() },
    fail,
    fsImpl: {},
    homeDir: "/tmp/cfhub-home",
  };
  installExtension({ ...base, opts: {} });
  expect(fail).toHaveBeenCalledWith("Missing --path to an extension directory");
  installExtension({
    ...base,
    opts: { path: "/source" },
    fsImpl: { readFileSync: () => JSON.stringify({ name: "bad name" }) },
  });
  expect(fail).toHaveBeenCalledWith("Invalid cfhub extension manifest");
});

test("refuses to replace an installed extension", () => {
  const fail = jest.fn();
  const fsImpl = {
    readFileSync: () => JSON.stringify({ name: "demo", version: "1", commands: {} }),
    mkdirSync: jest.fn(),
    mkdtempSync: jest.fn(() => "/tmp/cfhub-home/extensions/.stage"),
    existsSync: jest.fn(() => true),
    cpSync: jest.fn(),
  };
  installExtension({
    opts: { path: "/source" },
    printer: { log: jest.fn() },
    fail,
    fsImpl,
    homeDir: "/tmp/cfhub-home",
  });
  expect(fail).toHaveBeenCalledWith("Extension demo is installed. Run the upgrade command.");
  expect(fsImpl.cpSync).not.toHaveBeenCalled();
});

test("refuses an extension name that is unsafe on Windows", () => {
  const fail = jest.fn();
  const cpSync = jest.fn();
  installExtension({
    opts: { path: "source" },
    printer: { log: jest.fn() },
    fail,
    fsImpl: {
      readFileSync: () => JSON.stringify({ name: "C:drive", version: "1", commands: {} }),
      mkdirSync: jest.fn(),
      mkdtempSync: jest.fn(() => "/tmp/cfhub-home/extensions/.stage"),
      cpSync,
      renameSync: jest.fn(),
      rmSync: jest.fn(),
    },
    homeDir: "home",
  });
  expect(fail).toHaveBeenCalledWith("Invalid cfhub extension manifest");
  expect(cpSync).not.toHaveBeenCalled();
});

test("refuses an extension when its command file is missing", () => {
  const fail = jest.fn();
  const cpSync = jest.fn();
  installExtension({
    opts: { path: "/source" },
    printer: { log: jest.fn() },
    fail,
    fsImpl: {
      readFileSync: () =>
        JSON.stringify({ name: "demo", version: "1", commands: { demo: "index.mjs" } }),
      lstatSync: jest.fn(() => {
        throw new Error("missing file");
      }),
      mkdirSync: jest.fn(),
      mkdtempSync: jest.fn(() => "/tmp/cfhub-home/extensions/.stage"),
      cpSync,
      renameSync: jest.fn(),
      rmSync: jest.fn(),
    },
    homeDir: "/tmp/cfhub-home",
  });
  expect(fail).toHaveBeenCalledWith("Invalid cfhub extension manifest");
  expect(cpSync).not.toHaveBeenCalled();
});

test("refuses a broken symbolic link at the install destination", () => {
  const fail = jest.fn();
  const fsImpl = {
    readFileSync: () => JSON.stringify({ name: "demo", version: "1", commands: {} }),
    lstatSync: jest.fn(() => ({ isSymbolicLink: () => true })),
    mkdirSync: jest.fn(),
    cpSync: jest.fn(),
  };
  installExtension({
    opts: { path: "/source" },
    printer: { log: jest.fn() },
    fail,
    fsImpl,
    homeDir: "/tmp/cfhub-home",
  });
  expect(fail).toHaveBeenCalledWith("Extension demo is installed. Run the upgrade command.");
  expect(fsImpl.cpSync).not.toHaveBeenCalled();
});

test("allows an absent destination and rejects inspection errors", () => {
  const base = {
    readFileSync: () => JSON.stringify({ name: "demo", version: "1", commands: {} }),
    mkdirSync: jest.fn(),
    mkdtempSync: jest.fn(() => "/tmp/cfhub-home/extensions/.stage"),
    cpSync: jest.fn(),
    renameSync: jest.fn(),
    rmSync: jest.fn(),
  };
  const fail = jest.fn();
  installExtension({
    opts: { path: "/source" },
    printer: { log: jest.fn() },
    fail,
    fsImpl: {
      ...base,
      lstatSync: jest.fn(() => {
        throw Object.assign(new Error("missing"), { code: "ENOENT" });
      }),
    },
    homeDir: "/tmp/cfhub-home",
  });
  const inspectionError = Object.assign(new Error("access denied"), { code: "EACCES" });
  expect(() =>
    installExtension({
      opts: { path: "/source" },
      printer: { log: jest.fn() },
      fail,
      fsImpl: {
        ...base,
        lstatSync: jest.fn(() => {
          throw inspectionError;
        }),
      },
      homeDir: "/tmp/cfhub-home",
    }),
  ).toThrow(inspectionError);
});
