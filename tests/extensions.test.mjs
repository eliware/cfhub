import { jest } from "@jest/globals";
import path from "node:path";
import {
  discoverExtensions,
  extensionRoot,
  loadExtensionCommand,
  readExtensionManifest,
  validateExtensionManifest,
} from "../src/extensions.mjs";
import { createMemoryFs } from "../test-fixtures/unit/memory-fs.mjs";
import { mockNodeFs } from "../test-fixtures/unit/mock-node-fs.mjs";

test("validates extension manifest fields and optional name", () => {
  const manifest = { name: "hello", version: "1.0.0", commands: {} };
  expect(validateExtensionManifest(manifest)).toBe(true);
  expect(validateExtensionManifest(manifest, "hello")).toBe(true);
  expect(validateExtensionManifest(manifest, "other")).toBe(false);
  expect(validateExtensionManifest({ name: "hello" })).toBe(false);
  expect(validateExtensionManifest({ ...manifest, commands: { hello: "../outside.mjs" } })).toBe(
    false,
  );
  expect(validateExtensionManifest({ ...manifest, commands: { hello: "" } })).toBe(false);
  expect(validateExtensionManifest({ ...manifest, commands: [] })).toBe(false);
  expect(validateExtensionManifest({ ...manifest, commands: { hello: 4 } })).toBe(false);
  expect(validateExtensionManifest({ ...manifest, name: "../outside" })).toBe(false);
});

test("extension discovery and module loading use the manifest contract", async () => {
  const home = "/tmp/cfhub-home/ext-load";
  const root = extensionRoot(home);
  const fsImpl = createMemoryFs({
    [`${root}/hello/cf-extension.json`]: JSON.stringify({
      name: "hello",
      version: "1.0.0",
      commands: { hello: "hello.mjs" },
    }),
    [`${root}/hello/hello.mjs`]: "source",
  });
  expect(readExtensionManifest(root, "hello", fsImpl).name).toBe("hello");
  expect(discoverExtensions(home, fsImpl)).toHaveLength(1);
  const handler = await loadExtensionCommand(
    { name: "hello", commands: { hello: "hello.mjs" } },
    "hello",
    home,
    async () => ({ default: jest.fn() }),
  );
  expect(typeof handler).toBe("function");
  expect(await loadExtensionCommand({ name: "hello", commands: {} }, "missing", home)).toBeNull();
  expect(extensionRoot()).toContain(".config/cfhub/extensions");
  expect(discoverExtensions(home, {})).toEqual([]);
  expect(discoverExtensions(undefined, {})).toEqual([]);
  const invalid = path.join(root, "bad");
  fsImpl.writeFileSync(`${invalid}/cf-extension.json`, "{}");
  expect(() => readExtensionManifest(root, "bad", fsImpl)).toThrow(
    "Invalid cfhub extension manifest",
  );
  expect(discoverExtensions(home, fsImpl)).toHaveLength(1);
});

test("extension loader accepts named handlers and null modules", async () => {
  const home = "/tmp/cfhub-home/ext-exports";
  expect(
    typeof (await loadExtensionCommand(
      { name: "x", commands: { x: "run.mjs" } },
      "x",
      home,
      async () => ({ run() {} }),
    )),
  ).toBe("function");
  expect(
    typeof (await loadExtensionCommand(
      { name: "x", commands: { x: "handler.mjs" } },
      "x",
      home,
      async () => ({ handler() {} }),
    )),
  ).toBe("function");
  expect(
    await loadExtensionCommand(
      { name: "x", commands: { x: "empty.mjs" } },
      "x",
      home,
      async () => ({ value: 1 }),
    ),
  ).toBeNull();
  expect(await loadExtensionCommand({ name: "x", commands: {} }, "missing")).toBeNull();
});

test("extension loader rejects a command path outside its folder", async () => {
  await expect(
    loadExtensionCommand(
      { name: "x", commands: { bad: "../outside.mjs" } },
      "bad",
      "/tmp/cfhub-home",
    ),
  ).rejects.toThrow("Unsafe extension command path: bad");
  await expect(
    loadExtensionCommand({ name: "x", commands: { bad: "." } }, "bad", "/tmp/cfhub-home"),
  ).rejects.toThrow("Unsafe extension command path: bad");
  await expect(
    loadExtensionCommand(
      { name: "../outside", commands: { bad: "run.mjs" } },
      "bad",
      "/tmp/cfhub-home",
    ),
  ).rejects.toThrow("Unsafe extension command path: bad");
  await expect(
    loadExtensionCommand(
      { name: "x", commands: { bad: path.resolve("outside.mjs") } },
      "bad",
      "/tmp/cfhub-home",
    ),
  ).rejects.toThrow("Unsafe extension command path: bad");
});

test("extension helpers use their default paths, filesystem, and module loader", async () => {
  await jest.resetModules();
  const fsImpl = mockNodeFs(jest);
  const extensionApi = await import("../src/extensions.mjs");
  expect(extensionApi.extensionRoot()).toContain(".config/cfhub/extensions");
  expect(extensionApi.discoverExtensions()).toEqual([]);
  fsImpl.readFileSync.mockReturnValue(JSON.stringify({ name: "demo", version: "1", commands: {} }));
  expect(extensionApi.readExtensionManifest("/mock/extensions", "demo").name).toBe("demo");
  await expect(
    extensionApi.loadExtensionCommand({ name: "demo", commands: {} }, "missing"),
  ).resolves.toBeNull();
  await expect(
    extensionApi.importExtensionModule("data:text/javascript,export default 42"),
  ).resolves.toMatchObject({ default: 42 });
});
