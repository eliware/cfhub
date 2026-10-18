import moduleCatalog from "../../data/cloudflare-oauth-modules.json" with { type: "json" };
import { loadOAuthAccountData } from "./account/data.mjs";
import { selectOAuthModules } from "./module-selection.mjs";

export { REQUIRED_OAUTH_SCOPES, copyrightYear } from "./page-metadata.mjs";
export async function collectOAuthSummary({ accessToken, account, scopes, fetchImpl }) {
  const enabled = selectOAuthModules(moduleCatalog.modules, scopes);
  const data = await loadOAuthAccountData({ enabled, accessToken, fetchImpl });
  return { enabled, ...data, account };
}
