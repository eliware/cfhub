import { serveOAuthPickerVersionRoute } from "./version-route.mjs";
import { serveOAuthPickerStaticAsset } from "./static-assets.mjs";
import { serveOAuthPickerSubmitRoute } from "./submit-route.mjs";
import { serveOAuthPickerLandingRoute } from "./landing-route.mjs";

export function serveOAuthPickerRoute(options) {
  if (serveOAuthPickerVersionRoute(options)) return true;
  if (serveOAuthPickerLandingRoute(options)) return true;
  if (serveOAuthPickerStaticAsset(options)) return true;
  return serveOAuthPickerSubmitRoute(options);
}
