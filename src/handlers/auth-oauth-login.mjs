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
  fail,
  env = process.env,
}) {
  const { scopes, pickerScopes, ...oauthOptions } = authOAuthOptions(opts, env);
  const oauth = await oauthLogin({ ...oauthOptions, scopes, pickerScopes });
  return saveOAuthProfile({
    data,
    name,
    opts,
    scopes,
    oauth,
    writeCredentialImpl,
    write,
    profileHome,
    profileFs,
    fail,
    env,
  });
}
