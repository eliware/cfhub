import { readUpdateCache, updateCachePath } from "../../src/update/cache.mjs";

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

test("returns an empty cache on read errors", () => {
  expect(readUpdateCache("/missing", { existsSync: () => false })).toEqual({});
  expect(
    readUpdateCache("/bad", { existsSync: () => true, readFileSync: () => "invalid" }),
  ).toEqual({});
});
