import { jest } from "@jest/globals";
import {
  deleteKeychainCredential,
  loadKeychain,
  readKeychainCredential,
  writeKeychainCredential,
} from "../src/credential-keychain.mjs";

test("reads, writes, and deletes keychain credentials", async () => {
  const store = {
    getPassword: jest.fn().mockResolvedValue('{"token":"a"}'),
    setPassword: jest.fn(),
    deletePassword: jest.fn().mockResolvedValue(true),
  };
  const load = jest.fn().mockResolvedValue(store);
  await expect(readKeychainCredential("work", load)).resolves.toEqual({ token: "a" });
  await expect(writeKeychainCredential("work", { token: "b" }, load)).resolves.toBe(true);
  await expect(deleteKeychainCredential("work", load)).resolves.toBe(true);
  expect(store.getPassword).toHaveBeenCalledWith("cfhub", "work");
  expect(store.setPassword).toHaveBeenCalledWith("cfhub", "work", '{"token":"b"}');
  expect(store.deletePassword).toHaveBeenCalledWith("cfhub", "work");
});

test("returns empty results when the keychain is unavailable", async () => {
  const load = jest.fn().mockResolvedValue(null);
  await expect(readKeychainCredential("work", load)).resolves.toBeNull();
  await expect(writeKeychainCredential("work", {}, load)).resolves.toBe(false);
  await expect(deleteKeychainCredential("work", load)).resolves.toBe(false);
});

test("loads the optional keychain module and tolerates an import failure", async () => {
  await expect(loadKeychain(async (name) => ({ default: { name } }))).resolves.toEqual({
    name: "keytar",
  });
  await expect(
    loadKeychain(async () => {
      throw Error("not installed");
    }),
  ).resolves.toBeNull();
});
