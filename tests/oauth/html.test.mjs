import { escapeOAuthHtml } from "../../src/oauth/html.mjs";

test("escapes all HTML control characters and empty values", () => {
  expect(escapeOAuthHtml(`&<>"'`)).toBe("&amp;&lt;&gt;&quot;&#39;");
  expect(escapeOAuthHtml(null)).toBe("");
});
