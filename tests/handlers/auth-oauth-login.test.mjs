import { saveOAuthLogin } from "../../src/handlers/auth-oauth-login.mjs";

test("OAuth login stores the returned scope list", async () => {
  const data = { profiles: {} };
  await saveOAuthLogin({
    data,
    opts: {},
    name: "work",
    oauthLogin: async () => ({ accessToken: "t", scopes: ["zone.read"] }),
    writeCredentialImpl: async () => true,
    write: () => {},
  });
  expect(data.profiles.work.scopes).toEqual(["zone.read"]);
});
