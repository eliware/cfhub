import { fileURLToPath } from "node:url";
import path from "node:path";
import { loadEnvFile, projectRootFromMeta } from "../src/runtime.mjs";
import { loadEnvFile as sharedLoadEnvFile } from "../src/env.mjs";

test("runtime reuses the shared environment parser", () => {
  expect(loadEnvFile).toBe(sharedLoadEnvFile);
});

test("projectRootFromMeta returns the parent directory", () => {
  const expected = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  expect(projectRootFromMeta(new URL("../bin/cfhub.mjs", import.meta.url).href)).toBe(expected);
});
