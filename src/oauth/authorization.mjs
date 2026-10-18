import crypto from "node:crypto";

const AUTH_URL = "https://dash.cloudflare.com/oauth2/auth";
const base64url = (value) => value.toString("base64url");

export function createOAuthAuthorization({ clientId, redirectUri }) {
  const verifier = base64url(crypto.randomBytes(32));
  const challenge = base64url(crypto.createHash("sha256").update(verifier).digest());
  const state = base64url(crypto.randomBytes(24));
  const makeAuthorization = (selected, offlineAccess = false) => {
    const authorization = new URL(AUTH_URL);
    const authorizationScopes = offlineAccess ? [...selected, "offline_access"] : selected;
    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: authorizationScopes.join(" "),
      code_challenge: challenge,
      code_challenge_method: "S256",
      state,
    });
    for (const [key, value] of params) authorization.searchParams.set(key, value);
    return authorization;
  };
  return { verifier, state, makeAuthorization };
}
