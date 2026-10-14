import { VERSION } from "./version.mjs";
import { copyrightYear } from "./oauth-page-metadata.mjs";
import { createOAuthScopeModel } from "./oauth-scope-model.mjs";
import { serializeOAuthScopeModel } from "./oauth-scope-model-serialization.mjs";
import { renderOAuthTemplate } from "./oauth-template.mjs";
import { pickerAsset } from "./oauth-picker-assets.mjs";

export function pickerHtml() {
  const model = serializeOAuthScopeModel(createOAuthScopeModel());
  return renderOAuthTemplate(pickerAsset("oauth-web/oauth-picker.html"), {
    'href="/oauth-web/cf-logo.svg"': `href="/oauth-web/cf-logo.svg?v=${VERSION}"`,
    'href="/oauth-picker.css"': `href="/oauth-picker.css?v=${VERSION}"`,
    'src="/oauth-web/cloudflare-115x53.png"': `src="/oauth-web/cloudflare-115x53.png?v=${VERSION}"`,
    'src="/oauth-web/eliware-58x58.png"': `src="/oauth-web/eliware-58x58.png?v=${VERSION}"`,
    'src="/oauth-picker-app.mjs"': `src="/oauth-picker-app.mjs?v=${VERSION}"`,
    __CFHUB_SCOPE_MODEL__: model,
    __COPYRIGHT_YEAR__: copyrightYear(),
    __APP_VERSION__: VERSION,
  });
}
