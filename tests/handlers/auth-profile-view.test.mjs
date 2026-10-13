import { projectAuthProfiles } from "../../src/handlers/auth-profile-view.mjs";

test("projects auth and OAuth profile labels", () => {
  const data = { active: "work", profiles: { work: {}, saved: { authMethod: "oauth" } } };
  expect(projectAuthProfiles(data, "auth")).toEqual([
    { name: "work", active: true, authMethod: "api-token" },
    { name: "saved", active: false, authMethod: "oauth" },
  ]);
  expect(projectAuthProfiles(data, "oauth")[0].authMethod).toBe("oauth");
});

test("projects the default row for an empty profile store", () => {
  expect(projectAuthProfiles({ profiles: {} }, "auth")).toEqual([
    { name: "environment", active: true, authMethod: "not configured" },
  ]);
});
