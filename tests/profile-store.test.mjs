import { jest } from "@jest/globals";
import * as fs from "node:fs";
import os from "node:os";
import path from "node:path";
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

test("profile store uses the default filesystem adapter", () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "cfhub-profile-store-"));
  const data = { active: "work", profiles: { work: { apiToken: "token" } } };
  try {
    writeProfiles(data, home);
    expect(readProfiles(home)).toEqual(data);
    expect(activeProfile({}, home)).toMatchObject({ name: "work", apiToken: "token" });
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
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
