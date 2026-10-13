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

  expect(toJsonOutput).toHaveBeenCalledWith([{ name: "work", active: true, authMethod: "oauth" }]);
  expect(write).toHaveBeenCalledWith(data, "/workspace/test-home", {});
  expect(data.active).toBe("work");
});

import { fixtureCase1, fixtureCase2 } from "../../test-fixtures/unit/auth-profile-display.mjs";

test("profile listing prints active and inactive methods", fixtureCase1);
test("profile cleanup handles unknown and inactive profiles", fixtureCase2);
