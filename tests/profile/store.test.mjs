import { jest } from "@jest/globals";
import {
  activeProfile,
  profilesPath,
  readProfiles,
  writeProfiles,
} from "../../src/profile/store.mjs";
import { createMemoryFs } from "../../test-fixtures/unit/memory-fs.mjs";
import { mockNodeFs } from "../../test-fixtures/unit/mock-node-fs.mjs";

test("profile store returns an empty value when no file exists", () => {
  expect(readProfiles("/tmp/cfhub-test", { existsSync: () => false })).toEqual({
    active: null,
    profiles: {},
  });
});

test("profile store saves profiles and selects the active entry", () => {
  const files = new Map();
  const adapter = {
    mkdirSync: jest.fn(),
    writeFileSync: jest.fn((name, value) => files.set(name, value)),
    readFileSync: (name) => files.get(name),
    existsSync: (name) => files.has(name),
  };
  const data = { active: "work", profiles: { work: { apiToken: "token" } } };
  writeProfiles(data, "/tmp/cf-test-home", adapter);
  expect(profilesPath("/tmp/cf-test-home")).toContain("profiles.json");
  expect(readProfiles("/tmp/cf-test-home", adapter)).toEqual(data);
  expect(activeProfile({}, "/tmp/cf-test-home", adapter)).toMatchObject({ name: "work" });
  expect(adapter.mkdirSync).toHaveBeenCalled();
});

test("profile store writes and reads through the memory filesystem", () => {
  const home = "/tmp/cfhub-home/profile-store";
  const fsImpl = createMemoryFs();
  const data = { active: "work", profiles: { work: { apiToken: "token" } } };
  writeProfiles(data, home, fsImpl);
  expect(readProfiles(home, fsImpl)).toEqual(data);
  expect(activeProfile({}, home, fsImpl)).toMatchObject({ name: "work", apiToken: "token" });
});

test("profile store defaults its paths, environment, and filesystem inputs", () => {
  const files = new Map();
  const adapter = {
    mkdirSync: jest.fn(),
    writeFileSync: jest.fn((name, value) => files.set(name, value)),
    readFileSync: (name) => files.get(name),
    existsSync: (name) => files.has(name),
  };
  const data = { active: "work", profiles: { work: { apiToken: "token" } } };
  expect(profilesPath()).toContain("profiles.json");
  expect(readProfiles(undefined, { existsSync: () => false })).toEqual({
    active: null,
    profiles: {},
  });
  writeProfiles(data, undefined, adapter);
  expect(activeProfile(undefined, undefined, adapter)).toMatchObject({ name: "work" });
  expect(activeProfile({}, undefined, { existsSync: () => false })).toBeNull();
});

test("profile store uses the default filesystem adapter", async () => {
  await jest.resetModules();
  const fsImpl = mockNodeFs(jest);
  const store = await import("../../src/profile/store.mjs");
  expect(store.readProfiles()).toEqual({ active: null, profiles: {} });
  expect(store.activeProfile()).toBeNull();
  store.writeProfiles({ active: null, profiles: {} });
  expect(fsImpl.existsSync).toHaveBeenCalled();
  expect(fsImpl.renameSync).toHaveBeenCalled();
});

test("profile application uses its default environment and filesystem", async () => {
  await jest.resetModules();
  mockNodeFs(jest);
  const profileApi = await import("../../src/profiles.mjs");
  expect(profileApi.profilesPath()).toContain("profiles.json");
  expect(profileApi.activeProfile()).toBeNull();
  await expect(profileApi.applyActiveProfile()).resolves.toBeNull();
});
