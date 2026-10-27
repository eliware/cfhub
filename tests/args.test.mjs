import { parseArgs } from "../src/args.mjs";

test("splits positional args from flags", () => {
  expect(parseArgs(["zones", "list", "--json"])).toEqual({
    args: ["zones", "list"],
    opts: { json: true },
  });
});

test("supports --key=value syntax", () => {
  expect(parseArgs(["dns-records", "get", "--zone-id=abc123", "--id", "rec1"])).toEqual({
    args: ["dns-records", "get"],
    opts: { "zone-id": "abc123", id: "rec1" },
  });
});

test("parses explicit dry-run boolean values", () => {
  expect(parseArgs(["lists", "delete", "--dry-run=false"]).opts["dry-run"]).toBe(false);
  expect(parseArgs(["lists", "delete", "--dry-run=true"]).opts["dry-run"]).toBe(true);
  expect(parseArgs(["lists", "delete", "--dry-run", "false"]).opts["dry-run"]).toBe(false);
  expect(parseArgs(["lists", "delete", "--dry-run", "true"]).opts["dry-run"]).toBe(true);
});

test("captures flag values and bare flags", () => {
  expect(parseArgs(["list-items", "create", "--account-id", "acct1", "--force"])).toEqual({
    args: ["list-items", "create"],
    opts: { "account-id": "acct1", force: true },
  });
});
