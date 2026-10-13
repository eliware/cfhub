import { handleAuthLogin } from "../../src/handlers/auth-login.mjs";

test("auth login routes OAuth profiles to the OAuth workflow", async () => {
  const data = { profiles: {} };
  await handleAuthLogin({
    data,
    opts: {},
    name: "work",
    oauthLogin: async () => ({ accessToken: "token" }),
    writeCredentialImpl: async () => true,
    write: () => {},
  });
  expect(data.profiles.work.authMethod).toBe("oauth");
});
