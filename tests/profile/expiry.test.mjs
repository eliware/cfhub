import { jest } from "@jest/globals";
import { readProfiles } from "../../src/profile/store.mjs";
import { removeExpiredProfile } from "../../src/profile/expiry.mjs";

test("expiry cleanup deletes credentials and removes the active profile", async () => {
  const fsImpl = {
    existsSync: jest.fn(() => true),
    readFileSync: jest.fn(() => JSON.stringify({ active: "old", profiles: { old: {}, next: {} } })),
    mkdirSync: jest.fn(),
    writeFileSync: jest.fn(),
    chmodSync: jest.fn(),
  };
  const remove = jest.fn();
  await removeExpiredProfile("old", "/home", fsImpl, remove);
  expect(remove).toHaveBeenCalledWith("old");
  const saved = JSON.parse(fsImpl.writeFileSync.mock.calls[0][1]);
  expect(saved).toEqual({ active: "next", profiles: { next: {} } });
});

test("expiry cleanup preserves a different active profile", async () => {
  const fsImpl = {
    existsSync: jest.fn(() => true),
    readFileSync: jest.fn(() =>
      JSON.stringify({ active: "next", profiles: { old: {}, next: {} } }),
    ),
    mkdirSync: jest.fn(),
    writeFileSync: jest.fn(),
    chmodSync: jest.fn(),
  };
  await removeExpiredProfile("old", "/home", fsImpl, jest.fn());
  expect(readProfiles("/home", fsImpl).active).toBe("next");
});
