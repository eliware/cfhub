import { VERSION } from "./version.mjs";
import { copyrightYear } from "./oauth-page-metadata.mjs";
import { serializeOAuthScopeModel } from "./oauth-scope-model.mjs";
import { pickerAsset } from "./oauth-picker-assets.mjs";

export function pickerHtml() {
  return pickerAsset("oauth-web/oauth-picker.html")
    .replaceAll('href="/oauth-web/cf-logo.svg"', `href="/oauth-web/cf-logo.svg?v=${VERSION}"`)
    .replaceAll('href="/oauth-picker.css"', `href="/oauth-picker.css?v=${VERSION}"`)
    .replaceAll(
      'src="/oauth-web/cloudflare-115x53.png"',
      `src="/oauth-web/cloudflare-115x53.png?v=${VERSION}"`,
    )
    .replaceAll(
      'src="/oauth-web/eliware-58x58.png"',
      `src="/oauth-web/eliware-58x58.png?v=${VERSION}"`,
    )
    .replaceAll('src="/oauth-picker.mjs"', `src="/oauth-picker.mjs?v=${VERSION}"`)
    .replace("__CFHUB_SCOPE_MODEL__", serializeOAuthScopeModel())
    .replaceAll("__COPYRIGHT_YEAR__", copyrightYear())
    .replaceAll("__APP_VERSION__", VERSION);
}
