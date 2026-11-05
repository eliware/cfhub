import {
  actionVerbs,
  localResources,
  resourceLabels,
  resourceScopes,
  writeActions,
} from "../../../../src/help/action/command/catalog.mjs";
import { commandNamesFor, resourceNames } from "../../../../src/suggestions.mjs";

test("catalog describes every remote command resource", () => {
  for (const resource of Object.keys(resourceScopes)) {
    expect(resourceLabels[resource]).toEqual(expect.any(String));
    expect(["zone", "account", "either"]).toContain(resourceScopes[resource]);
  }
});

test("catalog covers every resource and action name", () => {
  for (const resource of resourceNames) {
    expect(resourceLabels[resource]).toEqual(expect.any(String));
    for (const action of commandNamesFor(resource)) {
      if (resource !== "api") expect(actionVerbs[action]).toEqual(expect.any(String));
    }
  }
});

test("catalog describes local resources and write actions", () => {
  expect([...localResources]).toEqual(["alias", "config", "extension", "auth", "oauth"]);
  expect([...writeActions]).toEqual([
    "create",
    "update",
    "delete",
    "set",
    "apply",
    "purge",
    "revoke",
  ]);
  expect(actionVerbs).toMatchObject({ list: "List", get: "Read", delete: "Delete" });
});
