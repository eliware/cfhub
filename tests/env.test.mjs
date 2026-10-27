import { jest } from "@jest/globals";
import { join, resolve } from "node:path";
import { loadProjectEnv, loadUserEnv, requireEnv } from "../src/env.mjs";
import { createMemoryFs } from "../test-fixtures/unit/memory-fs.mjs";
import { mockNodeFs } from "../test-fixtures/unit/mock-node-fs.mjs";

beforeEach(() => {
  for (const key of ["A_TEST_KEY", "B_TEST_KEY", "PROJECT_ONLY"]) delete process.env[key];
});

test("loadUserEnv reads ~/.cfhub", () => {
  const tmp = "/tmp/cfhub-home/user";
  const fsImpl = createMemoryFs({ [`${tmp}/.cfhub`]: "A_TEST_KEY=from-home\n" });

  loadUserEnv(tmp, process.env, fsImpl);

  expect(process.env.A_TEST_KEY).toBe("from-home");
});

test("loadProjectEnv reads .env from project root", () => {
  const tmp = resolve("virtual-project");
  const fsImpl = createMemoryFs({ [join(tmp, ".env")]: "PROJECT_ONLY=present\n" });

  loadProjectEnv(tmp, process.env, fsImpl, "/tmp/cfhub-home/user");

  expect(process.env.PROJECT_ONLY).toBe("present");
});

test("requireEnv returns values and throws when missing", () => {
  expect(requireEnv("TOKEN", { TOKEN: "ok" })).toBe("ok");
  expect(() => requireEnv("A_TEST_KEY")).toThrow("Missing A_TEST_KEY");
});

test("environment loaders return false when user and project files are missing", async () => {
  expect(loadUserEnv(undefined, {}, { existsSync: () => false })).toBe(false);
  await jest.resetModules();
  mockNodeFs(jest);
  const { loadProjectEnv: loadProjectEnvWithDefaults, loadUserEnv: loadUserEnvWithDefaults } =
    await import("../src/env.mjs");
  expect(loadUserEnvWithDefaults("/mock-home")).toBe(false);
  expect(loadProjectEnvWithDefaults("/mock-project")).toBe(false);
});
