import { loadOAuthAccountData } from "./account/data.mjs";
import { moduleCatalog, selectOAuthModules } from "./module-catalog.mjs";

export { copyrightYear } from "./page-metadata.mjs";
export { REQUIRED_OAUTH_SCOPES } from "./scope/required.mjs";
export async function collectOAuthSummary({ accessToken, account, scopes, fetchImpl }) {
  const enabled = selectOAuthModules(moduleCatalog.modules, scopes);
  const data = await loadOAuthAccountData({ enabled, accessToken, fetchImpl });
  return { enabled, ...data, account };
}
