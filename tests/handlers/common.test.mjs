import * as common from "../../src/handlers/common.mjs";
test("common helpers return identifiers", () => {
  expect(common.getId({ id: "x" })).toBe("x");
  expect(common.getAccountId({ "account-id": "a" })).toBe("a");
});
