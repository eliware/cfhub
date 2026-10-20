import { writeUpdateCache } from "../../src/update/cache-writer.mjs";

test("writes private cache data and applies file permissions", () => {
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

test("writes private cache data when chmod is unavailable", () => {
  const calls = [];
  const fs = {
    mkdirSync: (...args) => calls.push(["mkdir", ...args]),
    writeFileSync: (...args) => calls.push(["write", ...args]),
  };
  writeUpdateCache("/tmp/cfhub-user/.config/cfhub/update-check.json", "/tmp/cfhub-user", fs, {
    checkedAt: 10,
  });
  expect(calls).toEqual([
    ["mkdir", "/tmp/cfhub-user/.config/cfhub", { recursive: true }],
    [
      "write",
      "/tmp/cfhub-user/.config/cfhub/update-check.json",
      '{"checkedAt":10}\n',
      { mode: 0o600 },
    ],
  ]);
});
