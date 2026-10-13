import { VERSION } from "./version.mjs";
import { copyrightYear } from "./oauth-pages.mjs";
import { pickerAsset } from "./oauth-picker-assets.mjs";

function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character],
  );
}

export function failurePage({ title, detail }) {
  const logoData = encodeURIComponent(pickerAsset("oauth-web/cf-logo.svg")).replace(/'/g, "%27");
  return pickerAsset("oauth-web/oauth-result.html")
    .replaceAll("__RESULT_TITLE__", escapeHtml(title))
    .replaceAll("__RESULT_DETAIL__", escapeHtml(detail))
    .replaceAll("__RESULT_CSS__", pickerAsset("oauth-web/oauth-result.css"))
    .replaceAll("__CFHUB_LOGO_DATA__", logoData)
    .replaceAll("__COPYRIGHT__", copyrightYear())
    .replaceAll("__VERSION__", VERSION);
}
