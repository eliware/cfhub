import { saveOAuthProfile } from "./auth-oauth-profile-save.mjs";
import { authOAuthOptions } from "./auth-oauth-options.mjs";

export async function saveOAuthLogin({
  data,
  opts,
  name,
  oauthLogin,
  writeCredentialImpl,
  write,
  profileHome,
  profileFs,
}) {
  const { scopes, ...oauthOptions } = authOAuthOptions(opts);
  const oauth = await oauthLogin({ ...oauthOptions, scopes });
  await saveOAuthProfile({
    data,
    name,
    opts,
    scopes,
    oauth,
    writeCredentialImpl,
    write,
    profileHome,
    profileFs,
  });
}
