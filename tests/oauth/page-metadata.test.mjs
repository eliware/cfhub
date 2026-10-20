import { copyrightYear } from "../../src/oauth/page-metadata.mjs";

test("keeps the copyright year current and adds a range for later years", () => {
  expect(copyrightYear(2025)).toBe("2026");
  expect(copyrightYear(2026)).toBe("2026");
  expect(copyrightYear(2027)).toBe("2026-2027");
  expect(copyrightYear()).toBe("2026");
});
