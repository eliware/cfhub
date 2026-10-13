import { jest } from "@jest/globals";
import { ensurePrivateDirectory, parentDirectory } from "../src/filesystem-paths.mjs";

test("creates private directories and resolves parent paths", () => {
  const mkdirSync = jest.fn();
  ensurePrivateDirectory("/workspace/cfhub", { mkdirSync });
  expect(mkdirSync).toHaveBeenCalledWith("/workspace/cfhub", { recursive: true, mode: 0o700 });
  expect(parentDirectory("/workspace/cfhub/file.json")).toBe("/workspace/cfhub");
});
