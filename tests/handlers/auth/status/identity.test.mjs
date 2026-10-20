import { jest } from "@jest/globals";
import {
  requireAuthStatusToken,
  selectAuthStatusIdentity,
} from "../../../../src/handlers/auth/status/identity.mjs";

test("accepts and requires an authentication token", () => {
  expect(requireAuthStatusToken("token", jest.fn())).toBe(true);
  const fail = jest.fn();
  expect(requireAuthStatusToken("", fail)).toBe(false);
  expect(fail).toHaveBeenCalledWith("You are not logged into Cloudflare. Run: cfhub auth login");
});

test("selects account and user status identity from the token", () => {
  expect(
    selectAuthStatusIdentity({ token: "cfat_secret", data: { active: "work" } }),
  ).toMatchObject({ kind: "account", profile: "work" });
  expect(
    selectAuthStatusIdentity({ token: "user", resource: "oauth", data: { active: null } }),
  ).toMatchObject({ kind: "user", profile: "environment", resource: "oauth" });
  expect(
    selectAuthStatusIdentity({
      token: "user",
      activeProfile: "profile-env",
      data: { active: "work" },
    }),
  ).toMatchObject({ kind: "user", profile: "profile-env" });
});
