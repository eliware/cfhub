import { failurePage } from "../../src/oauth/failure-page.mjs";

test("failure page escapes title and detail text", () => {
  const page = failurePage({ title: "Bad <state>", detail: "Use & try again" });
  expect(page).toContain("Bad &lt;state&gt;");
  expect(page).toContain("Use &amp; try again");
});

test("failure page uses empty values when fields are missing", () => {
  const page = failurePage({});
  expect(page).not.toContain("__RESULT_TITLE__");
  expect(page).not.toContain("__RESULT_DETAIL__");
});
