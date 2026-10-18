import path from "node:path";
import { extensionDestination } from "../../../src/handlers/extension/destination.mjs";

test("builds a path inside the extension root", () => {
  const root = "extensions-root";
  expect(extensionDestination(root, "demo")).toBe(path.resolve(root, "demo"));
});

test.each(["", ".", "..", "../outside", "..\\outside", `${path.sep}outside`, "C:drive"])(
  "rejects unsafe extension name %s",
  (name) => {
    expect(extensionDestination("extensions-root", name)).toBeNull();
  },
);
