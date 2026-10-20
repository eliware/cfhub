import { collectOAuthSummary } from "../pages.mjs";
import { successPage } from "../success/page.mjs";
import { loadOAuthAccountIdentity } from "./identity.mjs";

export async function loadOAuthAccountSummary({ accessToken, scopes, fetchImpl }) {
  const account = await loadOAuthAccountIdentity({ accessToken, fetchImpl });
  const summary = await collectOAuthSummary({ accessToken, account, scopes, fetchImpl });
  return { account, summary, page: successPage({ account, scopes, summary }) };
}
