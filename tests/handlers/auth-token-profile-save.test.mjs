import { saveTokenProfile } from "../../src/handlers/auth-token-profile-save.mjs";

test("saves token permissions and activates the profile", () => {
  const data = { profiles: {} };
  const write = jest.fn();
  saveTokenProfile({
    data,
    name: "work",
    opts: { "zone-id": "z" },
    tokenInfo: { permissions: [], permissionsKnown: false, permissionSummary: {} },
    detectedAccountToken: true,
    accountId: "a",
    write,
  });
  expect(data.profiles.work).toMatchObject({
    authMethod: "account-api-token",
    accountId: "a",
    zoneId: "z",
  });
  expect(write).toHaveBeenCalled();
});
