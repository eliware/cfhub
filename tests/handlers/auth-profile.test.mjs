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

  await handleAuthProfile({
    ...base,
    action: "list",
    outputJson: true,
  });
  expect(toJsonOutput).toHaveBeenCalledWith([{ name: "work", active: true, authMethod: "oauth" }]);
  await handleAuthProfile({ ...base, action: "switch" });
  expect(data.active).toBe("work");
  expect(write).toHaveBeenCalledWith(data, "/workspace/test-home", {});
});

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
