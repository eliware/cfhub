import { jest } from "@jest/globals";
import { logoutAuthProfile } from "../../src/handlers/auth-profile-logout.mjs";

const options = () => ({
  name: "old",
  data: { active: "old", profiles: { old: {}, next: {} } },
  readCredentialImpl: jest.fn().mockResolvedValue({ oauthRefreshToken: "refresh" }),
  revokeOAuthImpl: jest.fn(),
  deleteCredentialImpl: jest.fn(),
  write: jest.fn(),
  profileHome: "/home",
  profileFs: {},
  printer: { log: jest.fn() },
  fail: jest.fn(),
});

test("revokes and removes a profile, then activates the next profile", async () => {
  const input = options();
  await logoutAuthProfile(input);
  expect(input.revokeOAuthImpl).toHaveBeenCalledWith({ token: "refresh" });
  expect(input.deleteCredentialImpl).toHaveBeenCalledWith("old");
  expect(input.data).toEqual({ active: "next", profiles: { next: {} } });
  expect(input.write).toHaveBeenCalledWith(input.data, "/home", {});
});

test("continues local cleanup when revocation fails and rejects unknown profiles", async () => {
  const input = options();
  input.readCredentialImpl.mockResolvedValue({ oauthAccessToken: "access" });
  input.revokeOAuthImpl.mockRejectedValue(Error("expired"));
  await logoutAuthProfile(input);
  expect(input.data.profiles.old).toBeUndefined();
  const unknown = options();
  unknown.name = "missing";
  await logoutAuthProfile(unknown);
  expect(unknown.fail).toHaveBeenCalledWith("Unknown profile: missing");
});

test("removes local profiles without OAuth tokens and preserves another active profile", async () => {
  const input = options();
  input.data.active = "next";
  input.readCredentialImpl.mockResolvedValue({ apiToken: "token" });
  input.deleteCredentialImpl.mockRejectedValue(Error("unavailable"));
  await logoutAuthProfile(input);
  expect(input.revokeOAuthImpl).not.toHaveBeenCalled();
  expect(input.data.active).toBe("next");
  expect(input.data.profiles.old).toBeUndefined();
});

test("removes a profile when the credential store has no entry", async () => {
  const input = options();
  input.readCredentialImpl.mockResolvedValue(null);
  await logoutAuthProfile(input);
  expect(input.revokeOAuthImpl).not.toHaveBeenCalled();
  expect(input.data.profiles.old).toBeUndefined();
});
