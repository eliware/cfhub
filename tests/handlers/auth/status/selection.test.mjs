import { jest } from "@jest/globals";
import { selectAuthStatusIdentity } from "../../../../src/handlers/auth/status/selection.mjs";

test("selects account and user status identity from the token", () => {
  expect(
    selectAuthStatusIdentity({
      token: "cfat_secret",
      fail: jest.fn(),
      data: { active: "work" },
    }),
  ).toMatchObject({ kind: "account", profile: "work" });
  expect(
    selectAuthStatusIdentity({
      token: "user",
      fail: jest.fn(),
      resource: "oauth",
      data: { active: null },
    }),
  ).toMatchObject({ kind: "user", profile: "environment", resource: "oauth" });
  expect(
    selectAuthStatusIdentity({
      token: "user",
      fail: jest.fn(),
      activeProfile: "profile-env",
      data: { active: "work" },
    }),
  ).toMatchObject({ kind: "user", profile: "profile-env" });
});
