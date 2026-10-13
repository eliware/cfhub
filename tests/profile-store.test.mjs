import { jest } from "@jest/globals";
import { activeProfile, profilesPath, readProfiles, writeProfiles } from "../src/profile-store.mjs";

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
