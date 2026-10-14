import { escapePickerMarkup } from "../../src/oauth-web/escape-picker-markup.mjs";

test("escapes characters that can change picker markup", () => {
  expect(escapePickerMarkup(`<x a="b">'&`)).toBe("&lt;x a=&quot;b&quot;&gt;&#39;&amp;");
});
