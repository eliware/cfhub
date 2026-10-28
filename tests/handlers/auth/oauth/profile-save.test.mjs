import { jest } from "@jest/globals";
import { saveOAuthProfile } from "../../../../src/handlers/auth/oauth/profile-save.mjs";

const input = (overrides = {}) => ({
  data: { profiles: {} },
  name: "work",
  opts: {},
  scopes: ["zone.read"],
  oauth: { accessToken: "access", refreshToken: "refresh" },
  writeCredentialImpl: jest.fn().mockResolvedValue(true),
  deleteCredentialImpl: jest.fn().mockResolvedValue(true),
  write: jest.fn(),
  fail: jest.fn(),
  ...overrides,
});

const failingWrite = () =>
  jest.fn(() => {
    throw new Error("disk full");
  });

test("saves OAuth tokens and activates the scoped profile", async () => {
  const args = input({
    opts: { "account-id": "a" },
    oauth: { accessToken: "access", scopes: ["dns.read"] },
  });
  await saveOAuthProfile(args);
  expect(args.data.profiles.work).toMatchObject({
    authMethod: "oauth",
    scopes: ["dns.read"],
    accountId: "a",
  });
  expect(args.writeCredentialImpl).toHaveBeenCalledWith(
    "work",
    expect.objectContaining({ oauthAccessToken: "access" }),
  );
  expect(args.write).toHaveBeenCalled();
});

test("uses requested scopes when OAuth returns no scope list", async () => {
  const args = input({ oauth: {} });
  await saveOAuthProfile(args);
  expect(args.data.profiles.work.scopes).toEqual(["zone.read"]);
});

test("does not save a profile when credential storage fails", async () => {
  const args = input({ writeCredentialImpl: jest.fn().mockResolvedValue(false) });
  await saveOAuthProfile(args);
  expect(args.data.profiles).toEqual({});
  expect(args.write).not.toHaveBeenCalled();
  expect(args.fail).toHaveBeenCalledWith(
    "Could not save OAuth credentials to the OS keychain or private credential file",
  );
});

test("removes new credentials when profile storage fails", async () => {
  const args = input({ write: failingWrite() });
  await expect(saveOAuthProfile(args)).resolves.toBe(false);
  expect(args.deleteCredentialImpl).toHaveBeenCalledWith("work");
  expect(args.data.profiles).toEqual({});
  expect(args.fail).toHaveBeenCalledWith(
    "Could not save the OAuth profile. The saved credentials were removed.",
  );
});

test("restores an existing profile when credential cleanup fails", async () => {
  const profile = { authMethod: "api-token" };
  const args = input({
    data: { profiles: { work: profile }, active: "other" },
    deleteCredentialImpl: jest.fn().mockResolvedValue(false),
    write: failingWrite(),
  });
  await expect(saveOAuthProfile(args)).resolves.toBe(false);
  expect(args.data.profiles.work).toBe(profile);
  expect(args.data.active).toBe("other");
  expect(args.fail).toHaveBeenCalledWith(
    "Could not save the OAuth profile. The credentials may remain saved.",
  );
});

test("restores previous credentials when profile storage fails", async () => {
  const profile = { authMethod: "api-token" };
  const args = input({
    data: { profiles: { work: profile }, active: "other" },
    readCredentialImpl: jest.fn().mockResolvedValue({ oauthAccessToken: "old-token" }),
    write: failingWrite(),
  });
  await expect(saveOAuthProfile(args)).resolves.toBe(false);
  expect(args.writeCredentialImpl).toHaveBeenNthCalledWith(2, "work", {
    oauthAccessToken: "old-token",
  });
  expect(args.data.profiles.work).toBe(profile);
  expect(args.fail).toHaveBeenCalledWith(
    "Could not save the OAuth profile. The previous credentials were restored.",
  );
});

test("does not replace credentials when it cannot read a saved profile", async () => {
  const args = input({
    data: { profiles: { work: { authMethod: "oauth" } }, active: "work" },
    readCredentialImpl: jest.fn().mockRejectedValue(new Error("locked")),
  });
  await expect(saveOAuthProfile(args)).resolves.toBe(false);
  expect(args.writeCredentialImpl).not.toHaveBeenCalled();
  expect(args.fail).toHaveBeenCalledWith(
    "Could not read the saved profile credentials before login",
  );
});

test("removes a new profile when credential cleanup fails", async () => {
  const args = input({
    deleteCredentialImpl: jest.fn().mockResolvedValue(false),
    write: failingWrite(),
  });
  await expect(saveOAuthProfile(args)).resolves.toBe(false);
  expect(args.data.profiles).toEqual({});
  expect(args.fail).toHaveBeenCalledWith(
    "Could not save the OAuth profile. The credentials may remain saved.",
  );
});
