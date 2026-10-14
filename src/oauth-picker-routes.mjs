import { serveOAuthPickerVersionRoute } from "./oauth-picker-version-route.mjs";
import { serveOAuthPickerStaticAsset } from "./oauth-picker-static-assets.mjs";
import { serveOAuthPickerSubmitRoute } from "./oauth-picker-submit-route.mjs";
import { serveOAuthPickerLandingRoute } from "./oauth-picker-landing-route.mjs";

export function serveOAuthPickerRoute(options) {
  if (serveOAuthPickerVersionRoute(options)) return true;
  if (serveOAuthPickerLandingRoute(options)) return true;
  if (serveOAuthPickerStaticAsset(options)) return true;
  return serveOAuthPickerSubmitRoute(options);
}
