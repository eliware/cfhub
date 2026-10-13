import { saveApiTokenLogin } from "../../src/handlers/auth-token-login.mjs";

test("API token login records the active token profile", async () => {
  const data = { profiles: {} };
  await saveApiTokenLogin({
    data,
    opts: { "token-stdin": true },
    name: "work",
    readToken: () => "token",
    promptToken: async () => "",
    promptAccountId: async () => "",
    printer: { log: () => {}, error: () => {} },
    fail: (message) => {
      throw Error(message);
    },
    inspectApiTokenImpl: async () => ({
      permissions: [],
      permissionsKnown: false,
      permissionSummary: {},
    }),
    writeCredentialImpl: async () => true,
    write: () => {},
  });
  expect(data.profiles.work.authMethod).toBe("api-token");
});
