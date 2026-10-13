import { handleAuthLogin } from "../../src/handlers/auth-login.mjs";

test("auth login routes OAuth profiles to the OAuth helper", async () => {
  const oauthLogin = async () => ({ accessToken: "token" });
  const writeCredentialImpl = async () => true;
  const write = () => {};
  const data = { profiles: {} };
  await handleAuthLogin({
    resource: "oauth",
    data,
    opts: {},
    name: "work",
    oauthLogin,
    writeCredentialImpl,
    write,
  });
  expect(data.profiles.work.authMethod).toBe("oauth");
});
