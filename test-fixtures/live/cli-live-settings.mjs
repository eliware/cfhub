import { activeProfile } from "../../src/profiles.mjs";
import { requiredScopes } from "../../src/scopes.mjs";

export const liveEnabled = process.env.CFHUB_LIVE_TESTS === "1";
export const wetEnabled = process.env.CFHUB_LIVE_MUTATIONS === "1";
export const includeInventory = process.env.CFHUB_LIVE_INCLUDE_INVENTORY === "1";
const profile = (() => {
  try {
    return activeProfile();
  } catch {
    return null;
  }
})();
export const liveReady = Boolean(profile || process.env.CLOUDFLARE_API_TOKEN);
export const grantedScopes = profile?.scopes?.length ? profile.scopes : null;
export { requiredScopes };
