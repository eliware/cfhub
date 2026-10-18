import { readUpdateCache, updateCachePath, writeUpdateCache } from "../../src/update/cache.mjs";

test("builds the cache path and reads valid cache data", () => {
  const path = updateCachePath("/tmp/cfhub-user");
  expect(path).toBe("/tmp/cfhub-user/.config/cfhub/update-check.json");
  expect(
    readUpdateCache(path, {
      existsSync: () => true,
      readFileSync: () => '{"checkedAt":10}',
    }),
  ).toEqual({ checkedAt: 10 });
});

test("returns an empty cache on read errors and writes private cache data", () => {
  expect(readUpdateCache("/missing", { existsSync: () => false })).toEqual({});
  expect(
    readUpdateCache("/bad", { existsSync: () => true, readFileSync: () => "invalid" }),
  ).toEqual({});

  const calls = [];
  const fs = {
    mkdirSync: (...args) => calls.push(["mkdir", ...args]),
    writeFileSync: (...args) => calls.push(["write", ...args]),
    chmodSync: (...args) => calls.push(["chmod", ...args]),
  };
  writeUpdateCache("/tmp/cfhub-user/.config/cfhub/update-check.json", "/tmp/cfhub-user", fs, {
    checkedAt: 10,
    latestVersion: "2.0.0",
  });
  expect(calls).toEqual([
    ["mkdir", "/tmp/cfhub-user/.config/cfhub", { recursive: true }],
    [
      "write",
      "/tmp/cfhub-user/.config/cfhub/update-check.json",
      '{"checkedAt":10,"latestVersion":"2.0.0"}\n',
      { mode: 0o600 },
    ],
    ["chmod", "/tmp/cfhub-user/.config/cfhub/update-check.json", 0o600],
  ]);
});
