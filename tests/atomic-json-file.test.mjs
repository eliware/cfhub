import { jest } from "@jest/globals";
import {
  ensurePrivateDirectory,
  parentDirectory,
  replaceJsonFile,
} from "../src/atomic-json-file.mjs";

test("atomic JSON replacement writes a private temp file and renames it", () => {
  const fsImpl = { writeFileSync: jest.fn(), chmodSync: jest.fn(), renameSync: jest.fn() };
  replaceJsonFile("/workspace/cfhub/data.json", { profile: true }, fsImpl);
  expect(fsImpl.writeFileSync).toHaveBeenCalledWith(
    expect.stringMatching(/data\.json\.\d+\.tmp$/),
    '{\n  "profile": true\n}\n',
    { mode: 0o600 },
  );
  expect(fsImpl.renameSync).toHaveBeenCalledWith(
    expect.stringMatching(/\.tmp$/),
    "/workspace/cfhub/data.json",
  );
  expect(fsImpl.chmodSync).toHaveBeenCalledTimes(2);
});

test("atomic JSON replacement works without chmod support", () => {
  const fsImpl = { writeFileSync: jest.fn(), renameSync: jest.fn() };
  expect(() => replaceJsonFile("data.json", {}, fsImpl, 0o640)).not.toThrow();
  expect(fsImpl.writeFileSync).toHaveBeenCalledWith(expect.any(String), "{}\n", { mode: 0o640 });
});

test("private directory helper sets restrictive mode", () => {
  const mkdirSync = jest.fn();
  ensurePrivateDirectory("/workspace/cfhub", { mkdirSync });
  expect(mkdirSync).toHaveBeenCalledWith("/workspace/cfhub", { recursive: true, mode: 0o700 });
  expect(parentDirectory("/workspace/cfhub/file.json")).toBe("/workspace/cfhub");
});
