import { jest } from "@jest/globals";
import { checkForUpdate } from "../../src/update/check.mjs";
function memoryFs(files = new Map()) {
  return {
    files,
    existsSync: (path) => files.has(path),
    readFileSync: (path) => files.get(path),
    mkdirSync: () => {},
    writeFileSync: (path, value) => files.set(path, value),
    chmodSync: () => {},
  };
}

test("update check caches once per interval and reports newer versions", async () => {
  const fs = memoryFs();
  const fetchImpl = jest
    .fn()
    .mockResolvedValue({ ok: true, json: async () => ({ version: "2.0.0" }) });
  const options = {
    currentVersion: "1.1.3",
    homeDir: "/tmp/cfhub",
    fsImpl: fs,
    fetchImpl,
    now: 86_400_001,
  };
  await expect(checkForUpdate(options)).resolves.toBe("2.0.0");
  await expect(checkForUpdate({ ...options, now: 86_401_000 })).resolves.toBe("2.0.0");
  expect(fetchImpl).toHaveBeenCalledTimes(1);
});

test("update check respects opt-out, current versions, bad responses, and failures", async () => {
  const fs = memoryFs();
  const fetchImpl = jest
    .fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ version: "1.1.3" }) })
    .mockResolvedValueOnce({ ok: false })
    .mockRejectedValueOnce(new Error("offline"));
  const base = { currentVersion: "1.1.3", homeDir: "/tmp/cfhub", fsImpl: fs, fetchImpl, now: 1 };
  await expect(
    checkForUpdate({ ...base, env: { CFHUB_NO_UPDATE_CHECK: "1" } }),
  ).resolves.toBeNull();
  await expect(checkForUpdate(base)).resolves.toBeNull();
  await expect(checkForUpdate({ ...base, now: 86_400_002 })).resolves.toBeNull();
  await expect(checkForUpdate({ ...base, now: 172_800_003 })).resolves.toBeNull();
});

test("update check uses defaults and recovers from invalid cache data", async () => {
  await expect(checkForUpdate()).resolves.toBeNull();
  await expect(checkForUpdate({ currentVersion: null })).resolves.toBeNull();
  const fs = {
    existsSync: () => true,
    readFileSync: () => "{invalid",
    mkdirSync: jest.fn(),
    writeFileSync: jest.fn(),
  };
  const fetchImpl = jest.fn().mockResolvedValue({ ok: false });
  await expect(
    checkForUpdate({
      currentVersion: "1.0.0",
      homeDir: "/tmp/cfhub",
      fsImpl: fs,
      fetchImpl,
      now: 86_400_001,
    }),
  ).resolves.toBeNull();
  expect(fetchImpl).toHaveBeenCalled();
  const withoutChmod = memoryFs();
  delete withoutChmod.chmodSync;
  await expect(
    checkForUpdate({
      currentVersion: "1.0.0",
      homeDir: "/tmp/cfhub",
      env: {},
      fsImpl: withoutChmod,
      fetchImpl: jest
        .fn()
        .mockResolvedValue({ ok: true, json: async () => ({ version: "1.0.0" }) }),
      now: 86_400_001,
    }),
  ).resolves.toBeNull();
  await expect(
    checkForUpdate({
      currentVersion: "1.0.0",
      homeDir: "/tmp/cfhub",
      env: {},
      fsImpl: memoryFs(),
      fetchImpl: jest.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error("invalid response");
        },
      }),
      now: 86_400_001,
    }),
  ).resolves.toBeNull();
});

test("update check handles missing fetch and missing timeout support", async () => {
  await expect(
    checkForUpdate({
      currentVersion: "1.0.0",
      homeDir: "/tmp/cfhub",
      env: {},
      fsImpl: memoryFs(),
      fetchImpl: null,
      now: 86_400_001,
    }),
  ).resolves.toBeNull();
  const abortSignal = globalThis.AbortSignal;
  globalThis.AbortSignal = {};
  const fetchImpl = jest.fn().mockResolvedValue({ ok: false });
  try {
    await expect(
      checkForUpdate({
        currentVersion: "1.0.0",
        homeDir: "/tmp/cfhub",
        env: {},
        fsImpl: memoryFs(),
        fetchImpl,
        now: 86_400_001,
      }),
    ).resolves.toBeNull();
  } finally {
    globalThis.AbortSignal = abortSignal;
  }
  expect(fetchImpl).toHaveBeenCalledWith("https://registry.npmjs.org/@eliware%2Fcfhub/latest", {});
});
