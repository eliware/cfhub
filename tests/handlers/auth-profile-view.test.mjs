import { jest } from "@jest/globals";
import { outputAuthProfiles, projectAuthProfiles } from "../../src/handlers/auth-profile-view.mjs";

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

test("outputs profile views as JSON or a table", () => {
  const data = {
    active: "work",
    profiles: { work: { authMethod: "oauth" }, saved: { authMethod: "api-token" } },
  };
  const toJsonOutput = jest.fn();
  const printer = { log: jest.fn() };
  outputAuthProfiles({ data, resource: "oauth", outputJson: true, toJsonOutput, printer });
  expect(toJsonOutput).toHaveBeenCalledWith([
    { name: "work", active: true, authMethod: "oauth" },
    { name: "saved", active: false, authMethod: "api-token" },
  ]);
  outputAuthProfiles({ data, resource: "oauth", outputJson: false, toJsonOutput, printer });
  expect(printer.log).toHaveBeenCalled();
});
