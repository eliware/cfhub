import { collectOAuthSummary } from "./oauth-pages.mjs";
import { successPage } from "./oauth-success-page.mjs";

const USER_URL = "https://api.cloudflare.com/client/v4/user";

export async function loadOAuthAccountSummary({ accessToken, scopes, fetchImpl }) {
  let account = null;
  try {
    const response = await fetchImpl(USER_URL, {
      headers: { authorization: `Bearer ${accessToken}` },
    });
    if (response.ok) account = (await response.json())?.result;
  } catch {
    // Account details improve the success page but do not gate login.
  }
  const summary = await collectOAuthSummary({ accessToken, account, scopes, fetchImpl });
  return { account, summary, page: successPage({ account, scopes, summary }) };
}
