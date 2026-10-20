import { countPickerScopes } from "../../../../src/oauth-web/picker/scope/count.mjs";

test("counts selected and total scopes across features", () => {
  const features = [
    { scopes: [{ scope: "zone.read" }, { scope: "zone.write" }] },
    { scopes: [{ scope: "dns.read" }] },
  ];
  expect(countPickerScopes(features, new Set(["zone.write", "dns.read"]))).toEqual({
    selected: 2,
    total: 3,
  });
  expect(countPickerScopes(features)).toEqual({ selected: 0, total: 3 });
  expect(countPickerScopes([])).toEqual({ selected: 0, total: 0 });
});
