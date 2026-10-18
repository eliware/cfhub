import { jest } from "@jest/globals";
import { join, resolve } from "node:path";
import { loadEnvFile, loadProjectEnv, loadUserEnv, requireEnv } from "../src/env.mjs";
import { createMemoryFs } from "../test-fixtures/unit/memory-fs.mjs";
import { mockNodeFs } from "../test-fixtures/unit/mock-node-fs.mjs";

beforeEach(() => {
  for (const key of ["A_TEST_KEY", "B_TEST_KEY", "PROJECT_ONLY"]) delete process.env[key];
});

test("loadEnvFile loads missing vars and preserves existing vars", () => {
  const fsImpl = createMemoryFs({
    "/project/.env": "A_TEST_KEY=from-file\nB_TEST_KEY=from-file\n",
  });
  process.env.B_TEST_KEY = "from-env";

  loadEnvFile("/project/.env", process.env, fsImpl);

  expect(process.env.A_TEST_KEY).toBe("from-file");
  expect(process.env.B_TEST_KEY).toBe("from-env");
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

test("requireEnv throws when missing", () => {
  expect(() => requireEnv("A_TEST_KEY")).toThrow("Missing A_TEST_KEY");
});

test("loadUserEnv handles a missing home file", () => {
  expect(loadUserEnv(undefined, {}, { existsSync: () => false })).toBe(false);
});

test("env helpers handle missing files and required values", () => {
  const missingFs = { existsSync: jest.fn(() => false) };
  expect(loadEnvFile("/missing", {}, missingFs)).toBe(false);
  expect(requireEnv("TOKEN", { TOKEN: "ok" })).toBe("ok");
  expect(() => requireEnv("TOKEN", {})).toThrow("Missing TOKEN");
});

test("environment loaders use their default environment and filesystem values", async () => {
  await jest.resetModules();
  mockNodeFs(jest);
  const { loadEnvFile, loadProjectEnv, loadUserEnv } = await import("../src/env.mjs");
  expect(loadEnvFile("/mock/.env")).toBe(false);
  expect(loadUserEnv("/mock-home")).toBe(false);
  expect(loadProjectEnv("/mock-project")).toBe(false);
});
