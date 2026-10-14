import { jest } from "@jest/globals";
import {
  resolveAuthStatusIdentity,
  selectAuthStatusIdentity,
} from "../../src/handlers/auth-status-identity.mjs";

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

test("rejects a missing token before status routing", () => {
  const fail = jest.fn();
  expect(resolveAuthStatusIdentity({ token: "", fail })).toBeNull();
  expect(fail).toHaveBeenCalledWith("You are not logged into Cloudflare. Run: cfhub auth login");
});
