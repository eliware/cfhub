import { jest } from "@jest/globals";
import { logoutAuthProfile } from "../../../../src/handlers/auth/profile/logout.mjs";

const options = () => ({
  name: "old",
  data: { active: "old", profiles: { old: { authMethod: "oauth" }, next: {} } },
  readCredentialImpl: jest.fn().mockResolvedValue({ oauthRefreshToken: "refresh" }),
  revokeOAuthImpl: jest.fn().mockResolvedValue(true),
  deleteCredentialImpl: jest.fn(),
  write: jest.fn(),
  profileHome: "/home",
  profileFs: {},
  printer: { log: jest.fn(), error: jest.fn() },
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
  expect(input.printer.error).toHaveBeenCalledWith(
    "Cloudflare could not revoke the OAuth token. The local profile was removed.",
  );
  expect(input.data.profiles.old).toBeUndefined();
  const unknown = options();
  unknown.name = "missing";
  await logoutAuthProfile(unknown);
  expect(unknown.fail).toHaveBeenCalledWith("Unknown profile: missing");
  const unnamed = options();
  unnamed.name = "";
  await logoutAuthProfile(unnamed);
  expect(unnamed.fail).toHaveBeenCalledWith("Unknown profile: (none)");
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

test("revokes an OAuth access token and removes its credential", async () => {
  const input = options();
  input.readCredentialImpl.mockResolvedValue({ oauthAccessToken: "access-token" });
  await logoutAuthProfile(input);
  expect(input.revokeOAuthImpl).toHaveBeenCalledWith({ token: "access-token" });
  expect(input.deleteCredentialImpl).toHaveBeenCalledWith("old");
  expect(input.data.profiles.old).toBeUndefined();
});

test("reports when Cloudflare does not confirm token revocation", async () => {
  const input = options();
  input.revokeOAuthImpl.mockResolvedValue(false);
  await logoutAuthProfile(input);
  expect(input.printer.error).toHaveBeenCalledWith(
    "Cloudflare did not confirm OAuth token revocation. The local profile was removed.",
  );
  expect(input.data.profiles.old).toBeUndefined();
});

test("does not send API-token profile credentials to OAuth revocation", async () => {
  const input = options();
  input.data.profiles.old.authMethod = "api-token";
  input.readCredentialImpl.mockResolvedValue({ oauthAccessToken: "stale-oauth-token" });
  await logoutAuthProfile(input);
  expect(input.revokeOAuthImpl).not.toHaveBeenCalled();
  expect(input.deleteCredentialImpl).toHaveBeenCalledWith("old");
});
