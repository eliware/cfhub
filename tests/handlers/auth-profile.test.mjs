import { jest } from "@jest/globals";
import { handleAuthProfile } from "../../src/handlers/auth-profile.mjs";

test("auth profile helper lists and activates saved profiles", async () => {
  const data = { active: "work", profiles: { work: { authMethod: "oauth" } } };
  const write = jest.fn();
  const toJsonOutput = jest.fn();
  const base = {
    resource: "oauth",
    opts: { profile: "work" },
    data,
    outputJson: true,
    toJsonOutput,
    printer: { log: jest.fn() },
    fail: jest.fn(),
    write,
    profileHome: "/workspace/test-home",
    profileFs: {},
    readCredentialImpl: jest.fn(),
    revokeOAuthImpl: jest.fn(),
    deleteCredentialImpl: jest.fn(),
  };

  await handleAuthProfile({ ...base, action: "list" });
  await handleAuthProfile({ ...base, action: "switch" });
  expect(data.active).toBe("work");
  await handleAuthProfile({
    ...base,
    action: "logout",
    readCredentialImpl: jest.fn().mockResolvedValue({}),
  });

  expect(toJsonOutput).toHaveBeenCalledWith([{ name: "work", active: true, authMethod: "oauth" }]);
  expect(write).toHaveBeenCalledWith(data, "/workspace/test-home", {});
  expect(data.active).toBeNull();
  expect(data.profiles.work).toBeUndefined();
});

import { fixtureCase1 } from "../../test-fixtures/unit/auth-profile-display.mjs";

test("profile listing prints active and inactive methods", fixtureCase1);

test("ignores actions outside list, switch, and logout", async () => {
  const fail = jest.fn();
  const log = jest.fn();
  await handleAuthProfile({
    action: "unknown",
    data: { active: null, profiles: {} },
    fail,
    printer: { log },
  });
  expect(fail).not.toHaveBeenCalled();
  expect(log).not.toHaveBeenCalled();
});
