import { updateNotice } from "../../src/update/notice.mjs";

test("formats an update notice with the scoped install command", () => {
  expect(updateNotice("2.0.0", "1.1.3")).toBe(
    "A newer cfhub version is available: 2.0.0 (installed: 1.1.3)\nRun: npm install --global @eliware/cfhub@latest",
  );
});

test("returns no notice when no newer version is available", () => {
  expect(updateNotice(null, "1.1.3")).toBeNull();
});
