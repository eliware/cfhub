import { jest } from "@jest/globals";
import { loadEnvFile } from "../../src/env/file-loader.mjs";
import { createMemoryFs } from "../../test-fixtures/unit/memory-fs.mjs";
import { mockNodeFs } from "../../test-fixtures/unit/mock-node-fs.mjs";

test("loads file values and preserves existing environment values", () => {
  const env = { B_TEST_KEY: "from-env" };
  const fsImpl = createMemoryFs({
    "/project/.env": "A_TEST_KEY=from-file\nB_TEST_KEY=from-file\n",
  });
  expect(loadEnvFile("/project/.env", env, fsImpl)).toBe(true);
  expect(env).toEqual({ A_TEST_KEY: "from-file", B_TEST_KEY: "from-env" });
});

test("returns false for missing files with injected and default values", async () => {
  expect(loadEnvFile("/missing", {}, { existsSync: jest.fn(() => false) })).toBe(false);
  await jest.resetModules();
  const fsImpl = mockNodeFs(jest);
  const { loadEnvFile: loadEnvFileWithDefaults } = await import("../../src/env/file-loader.mjs");
  expect(loadEnvFileWithDefaults("/mock/.env")).toBe(false);
  expect(fsImpl.existsSync).toHaveBeenCalledWith("/mock/.env");
});
