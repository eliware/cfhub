import { REQUIRED_OAUTH_SCOPES } from "../../../src/oauth/scope/required.mjs";

test("provides the OAuth scopes required for every login", () => {
  expect(REQUIRED_OAUTH_SCOPES).toEqual(["user-details.read", "zone.read"]);
});
