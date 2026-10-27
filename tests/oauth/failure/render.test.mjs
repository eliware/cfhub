import { renderFailurePage } from "../../../src/oauth/failure/render.mjs";

test("renders escaped failure details and page assets", () => {
  const page = renderFailurePage({ title: "Bad <state>", detail: "Use & try again" });
  expect(page).toContain("Bad &lt;state&gt;");
  expect(page).toContain("Use &amp; try again");
  expect(page).toContain("data:image/svg+xml");
  expect(page).toContain("color-scheme: dark");
  expect(page).not.toContain("__RESULT_TITLE__");
  expect(page).not.toContain("__RESULT_DETAIL__");
});
