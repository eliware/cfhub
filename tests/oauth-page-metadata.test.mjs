import { copyrightYear, REQUIRED_OAUTH_SCOPES } from "../src/oauth-page-metadata.mjs";

test("provides required OAuth scopes and the copyright year", () => {
  expect(REQUIRED_OAUTH_SCOPES).toEqual(["user-details.read", "zone.read"]);
  expect(copyrightYear(2026)).toBe("2026");
  expect(copyrightYear(2027)).toBe("2026-2027");
  expect(copyrightYear()).toBe("2026");
});
